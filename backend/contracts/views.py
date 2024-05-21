from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Ledgifier.middleware.jwt_middleware import validate_jwt_token
from dotenv import load_dotenv
import os
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
import requests
import json
import re
import time
import openai
import google.generativeai as genai
from web3 import Web3, AsyncWeb3
from eth_account import Account
from web3.contract import Contract
from .serializers import ContractSerializer
from .models import Contract
from solcx import compile_standard, install_solc
import anthropic
from hexbytes import HexBytes

load_dotenv()

# Create your views here.

PINECONE_KEY = os.environ.get("PINECONE_KEY")
PINECONE_HOST = os.environ.get("PINECONE_HOST")
OPENAI_KEY = os.environ.get("OPENAI_KEY")
GEMINI_KEY = os.environ.get("GEMINI_KEY")
NETWORK_URL = os.environ.get("NETWORK_URL")
PRIVATE_KEY = os.environ.get("PRIVATE_KEY")
CLAUDE_KEY = os.environ.get("CLAUDE_KEY")
pattern = r"```(?:[a-zA-Z]*\n)?([\s\S]+?)```"


def generate_chat_completion(messages, model="gpt-4", temperature=1, max_tokens=None):
    gpt_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_KEY}",
    }

    gpt_data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }

    if max_tokens is not None:
        gpt_data["max_tokens"] = max_tokens

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=gpt_headers,
        data=json.dumps(gpt_data),
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")


def modify_import_paths(solidity_code):
    # Define the prefix to add
    prefix = "./node_modules/"
    # Split the code into lines for processing
    lines = solidity_code.split("\n")
    # Modify the lines that start with the import statement
    modified_lines = [
        (
            line.replace(
                'import "@openzeppelin/', 'import "{}@openzeppelin/'.format(prefix)
            )
            if line.strip().startswith('import "@openzeppelin/')
            else line
        )
        for line in lines
    ]
    # Join the modified lines back into a single string
    modified_code = "\n".join(modified_lines)
    return modified_code


def convert_strings(items):
    converted_items = []
    blockchain_address_pattern = (
        r"^0x[a-fA-F0-9]{40}$"  # Simple pattern for Ethereum-like addresses
    )

    for item in items:
        # Check for blockchain address
        if re.match(blockchain_address_pattern, item):
            converted_items.append(item)  # Keep as is
            continue

        try:
            # Attempt to convert to integer
            num = int(item)
            converted_items.append(num)  # Convert to integer
        except ValueError:
            # Leave as is if it's neither a number nor a blockchain address
            converted_items.append(item)

    return converted_items


class Generate(APIView):
    def post(self, request):
        try:
            valid = validate_jwt_token(request)
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)
            print("created_by: ", request.user["uid"])

            title = request.data["title"]
            contract = request.data["contract"]

            code = ""
            # time.sleep(5)

            # Initialize LangChain with OpenAI LLM
            embeddings_model = OpenAIEmbeddings(openai_api_key=OPENAI_KEY)

            # Initialize Pinecone
            pinecone = Pinecone(api_key=PINECONE_KEY)
            index = pinecone.Index(host=PINECONE_HOST)
            user_vector = embeddings_model.embed_query(contract)
            index.query(vector=user_vector, top_k=1)

            client = openai.OpenAI(api_key=OPENAI_KEY)

            assistant = client.beta.assistants.create(
                name="Solidity Contract Code Generator",
                instructions="You are an A+ grade solidity contract code generator. Write top A+ grade solidity code without any comments and explanations. The solidity code must be the latest version",
                tools=[{"type": "code_interpreter"}],
                model="gpt-4-1106-preview",
            )
            thread = client.beta.threads.create()
            print("Checking assistant status. ")

            genai.configure(api_key=GEMINI_KEY)

            gemini_model = genai.GenerativeModel("gemini-pro")
            for i in range(4):
                if i == 2:
                    chat = gemini_model.start_chat()
                    response = chat.send_message(
                        "Here is the latest version after GPT's revisions. "
                        + code
                        + "Can you make it stronger and submit it back to me? The solidity code must be the top grade A+"
                    )
                    result = response.text
                    # print("gemini_response result: ", result)
                    try:
                        code = re.findall(pattern, result)[0]
                    except:
                        pass
                    print("gemini_response_code: ", code)
                    continue
                elif i == 0:
                    client.beta.threads.messages.create(
                        thread_id=thread.id,
                        role="user",
                        content=contract,
                    )
                # elif i == 1:
                #     client.beta.threads.messages.create(
                #         thread_id=thread.id,
                #         role="user",
                #         content="Now can you can output a better version incorporating all the suggestions you made above?",
                #     )
                elif i == 3:
                    claude_client = anthropic.Anthropic(api_key=CLAUDE_KEY)
                    message = claude_client.messages.create(
                        model="claude-3-opus-20240229",
                        max_tokens=1024,
                        messages=[
                            {
                                "role": "user",
                                "content": "Here is the latest solidity code version form google gemini. "
                                + code
                                + "Can you make it stronger and submit it back to me? The solidity code must be the top grade A+",
                            }
                        ],
                    )
                    result = message.content[0].text
                    # print("claude result: ", result)
                    try:
                        code = re.findall(pattern, result)[0]
                    except:
                        pass
                    print("claude code: ", code)
                else:
                    client.beta.threads.messages.create(
                        thread_id=thread.id,
                        role="user",
                        content="I received this version of solidity contract code from Claude model after your revisions and it seems to be stronger. "
                        + code
                        + "\n Can you make it stronger from here? The solidity code must be the top grade A+",
                    )
                run = client.beta.threads.runs.create(
                    thread_id=thread.id,
                    assistant_id=assistant.id,
                )
                while True:
                    process = client.beta.threads.runs.retrieve(
                        thread_id=thread.id, run_id=run.id
                    )
                    if process.status == "completed":
                        print("index: ", i)
                        result = (
                            client.beta.threads.messages.list(thread_id=thread.id)
                            .data[0]
                            .content[0]
                            .text.value
                        )
                        # print("result: ", result)
                        try:
                            code = re.findall(pattern, result)[0]
                        except:
                            pass
                        print("code: ", code)
                        break
                    else:
                        time.sleep(1)

            print("done")
            serializer = ContractSerializer(
                data={
                    "title": title,
                    "contract": contract,
                    "code": code,
                    "created_by": request.user["uid"],
                }
            )

            is_valid = serializer.is_valid()

            if not is_valid:
                return Response(
                    {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save()

            return Response(
                {
                    "code": code,
                    "message": "contract generated successfully.",
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        try:
            print("get contract")
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            current_user_uid = request.user["uid"]

            user_contracts = Contract.objects.filter(created_by=current_user_uid)

            total = user_contracts.count()

            return Response(
                {
                    "contracts": [
                        ContractSerializer(contract).data for contract in user_contracts
                    ],
                    "total": total,
                    "message": "Your projects were retrived successfully.",
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class Deploy(APIView):
    def post(self, request):
        try:
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            print("created_by: ", request.data)
            contract = request.data["contract"]
            contract = modify_import_paths(contract)

            version_pattern = r"pragma\s+solidity\s+([^;]+);"
            version_match = re.search(version_pattern, contract)

            if version_match:
                solidity_version = version_match.group(1)[1:]
                print(f"Solidity Version: {solidity_version}")
            else:
                print("Solidity Version not found.")

            pattern = r"\bcontract\s+(\w+)"
            match = re.search(pattern, contract)

            if match:
                contract_name = match.group(1)
                print(f"Contract Name: {contract_name}")
            else:
                print("Contract name not found.")

            base_path = os.path.dirname(os.path.abspath(__file__))
            # base_path = os.path.dirname(os.getcwd())
            allow_paths = os.path.join(base_path, "node_modules")
            print("allow_paths: ", allow_paths)

            install_solc(solidity_version)

            compiled_sol = compile_standard(
                {
                    "language": "Solidity",
                    "sources": {"contract.sol": {"content": contract}},
                    "settings": {
                        "outputSelection": {
                            "*": {
                                "*": [
                                    "metadata",
                                    "evm.bytecode",
                                    "evm.bytecode.sourceMap",
                                ]
                            }
                        }
                    },
                },
                solc_version=solidity_version,
                allow_paths="/var/www/server/node_modules",
            )

            bytecode = compiled_sol["contracts"]["contract.sol"][contract_name]["evm"][
                "bytecode"
            ]["object"]

            abi_json = json.loads(
                compiled_sol["contracts"]["contract.sol"][contract_name]["metadata"]
            )["output"]["abi"]

            web3 = Web3(Web3.HTTPProvider(NETWORK_URL))
            print("NETWORK_URL: ", NETWORK_URL)
            print("web3 connected: ", web3.is_connected())

            abi = json.dumps(abi_json)

            account = Account.from_key(PRIVATE_KEY)

            chain_id = web3.eth.chain_id  # Network chain ID
            print("chain_id: ", chain_id)
            # gas_price = web3.eth.gas_price
            gas_price = int(web3.eth.gas_price * 1)

            MyContract = web3.eth.contract(abi=abi, bytecode=bytecode)
            print("done")
            p = convert_strings(request.data["params"])

            transaction = MyContract.constructor(*p).build_transaction(
                {
                    "chainId": chain_id,
                    "gasPrice": gas_price,
                    "from": account.address,
                    "nonce": web3.eth.get_transaction_count(account.address),
                }
            )

            signed_txn = account.sign_transaction(transaction)

            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            print("transaction hash: ", tx_hash)

            tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

            print(f"tx_receipt: ", tx_receipt)
            print(f"Contract Deployed At: {tx_receipt.contractAddress}")

            contract = Contract.objects.filter(uid=request.data["uid"]).first()
            print("contract: ", contract)
            contract.deploy_address = tx_receipt.contractAddress
            contract.from_address = account.address
            contract.tx_hash = tx_receipt.transactionHash.hex()
            contract.block_hash = tx_receipt.blockHash.hex()
            contract.block_number = tx_receipt.blockNumber
            contract.gas_used = tx_receipt.gasUsed
            contract.save()

            return Response(
                {
                    "address": tx_receipt.contractAddress,
                    "from_address": account.address,
                    "tx_hash": tx_receipt.transactionHash.hex(),
                    "block_hash": tx_receipt.blockHash.hex(),
                    "block_number": tx_receipt.blockNumber,
                    "gas_used": tx_receipt.gasUsed,
                    "message": "contract deployed successfully.",
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EditTitle(APIView):
    def put(self, request):
        try:
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            title = request.data["title"]

            contract = Contract.objects.filter(uid=request.data["uid"]).first()
            contract.title = title
            contract.save()

            return Response(
                {
                    "result": "success",
                    "message": "Title edited successfully.",
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class Remove(APIView):
    def post(self, request):
        try:
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            contract = Contract.objects.filter(uid=request.data["uid"]).first()
            contract.delete()

            return Response(
                {
                    "result": "success",
                    "message": "Title edited successfully.",
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class Save(APIView):
    def put(self, request):
        try:
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            code = request.data["code"]
            contract = Contract.objects.filter(uid=request.data["uid"]).first()
            contract.code = code
            contract.save()

            return Response(
                {
                    "result": "success",
                    "message": "Contract saved successfully.",
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContractDetail(APIView):
    def post(self, request):
        try:
            print("get contract")
            valid = validate_jwt_token(request)
            # check if valid is bool before proceeding
            if type(valid) is not bool:
                return Response(valid, status=status.HTTP_401_UNAUTHORIZED)

            contract_id = request.data["contractId"]

            contract = Contract.objects.filter(uid=contract_id)

            return Response(
                {
                    "contract": ContractSerializer(contract[0]).data,
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
