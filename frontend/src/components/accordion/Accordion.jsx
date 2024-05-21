// Accordion.js

export default function Accordion(props) {
  return (
    <div className="border rounded-md mb-1">
      <button
        className="w-full p-4 text-left bg-gray-200  
                            hover:bg-gray-300 transition duration-300"
        onClick={props.toggleAccordion}
      >
        {props.title}
        <span
          className={`float-right transform ${
            props.isOpen ? "rotate-180" : "rotate-0"
          }  
                                    transition-transform duration-300`}
        >
          &#9660;
        </span>
      </button>
      {props.isOpen && (
        <div className="flex flex-col p-4 bg-white">
          <span>{props.data}</span>
          <div className="flex flex-row justify-end">
            <button
              className="w-24 flex justify-center gap-1 text-white px-3 py-2 m-2 rounded-md shadow"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(111, 137, 251) 0%, rgb(92, 110, 245) 29%, rgb(81, 81, 236) 100%)",
              }}
            >
              <span>Run</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
