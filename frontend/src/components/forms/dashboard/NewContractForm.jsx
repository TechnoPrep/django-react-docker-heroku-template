import { Input, Form, Row, Button, Select } from "antd";
import logoImage from "../../../assets/logo.png";
import toast from "react-hot-toast";
import ProjectService from "../../../services/project.service";
import { ProjectsTypes } from "../../../utils/data";

const NewContractForm = ({ handleCancel, handleOk, onCreated }) => {
  return (
    <Form
      onFinish={(values) => {
        toast.promise(ProjectService.createProject(values), {
          loading: "Creating Contract.",
          success: (_) => {
            handleOk();
            onCreated();
            return "Created Contract.";
          },
          error: (err) => {
            let error = JSON.stringify(err.response.data.error);
            return (
              <div className="flex gap-2 p-1 flex-col">
                <div className="text-red-500 font-semibold test-sm">
                  Error occured, While logging in
                </div>
                <div>{error}</div>
              </div>
            );
          },
        });
      }}
      layout="vertical"
    >
      <div className="mt-6 mb-5 flex flex-col items-center">
        <img src={logoImage} className="mb-2 w-[7rem]" />
        <Form.Item
          label="Name"
          name="name"
          className="mb-1 mt-5 w-full"
          rules={[{ required: true, min: 1 }]}
        >
          <Input placeholder="Contract name" />
        </Form.Item>
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, enum: ["nfts", "daos"] }]}
          className="mb-1 w-full"
        >
          <Select placeholder="Select Contract Type">
            {ProjectsTypes.map((project_type, index) => (
              <Select.Option value={project_type.value} key={index}>
                {project_type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              min: 10,
            },
          ]}
          className="mb-1 w-full"
        >
          <Input placeholder="Contract Description" />
        </Form.Item>
      </div>
      <Row justify="end" className="gap-4">
        <Button onClick={handleCancel}>Cancel</Button>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#3636f8] hover:bg-[#2828df]"
          >
            Create
          </Button>
        </Form.Item>
      </Row>
    </Form>
  );
};

export default NewContractForm;
