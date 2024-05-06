import { toast } from "react-toastify";

const URL = process.env.REACT_APP_URL;

export const runAutomation = async (
  toolname,
  file,
  setIsResponse,
  setIsToolProcessing,
) => {
  // toolname = Signup | Ticket | Email
  if (!navigator.onLine) {
    return toast.error("Failed! Check Your Connection.");
  }

  try {
    if (file === null || file === undefined) {
      toast.error("Please upload a file.");
      return;
    }

    const fileType = file.type;
    if (
      fileType !== "application/vnd.ms-excel" &&
      fileType !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "text/csv" &&
      !file.name.endsWith(".csv")
    ) {
      toast.error("Please upload (.csv | .xlsx) file");
      return;
    }

    const myHeaders = new Headers();

    const formdata = new FormData();
    formdata.append("file", file);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    toast.info("Your file is in processing now.");
    setIsToolProcessing(true);
    setIsResponse(false);

    const startTime = performance.now();
    const response = await fetch(`${URL}/${toolname}/upload`, requestOptions);
    const result = await response.json();

    if (!result.status) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }

  } catch (err) {
    setIsToolProcessing(false)
    toast.error(err.message);
  }
};

