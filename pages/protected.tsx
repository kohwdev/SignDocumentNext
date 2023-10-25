import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "../components/layout";
import AccessDenied from "../components/access-denied";

export default function ProtectedPage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState();
  const [selectedCID, setSelectedCID] = useState("");
  const [signedPdfURL, setSignedPdfURL] = useState(""); // Initialize the state

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/examples/protected");
      const json = await res.json();
      if (json.content) {
        setContent(json.content);
        setSignedPdfURL(json.signedPdfURL); // Set the signed PDF URL in the state
      }
    };
    fetchData();
  }, [session]);

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  const handleCIDChange = (e: any) => {
    setSelectedCID(e.target.value);
  };
  const handleFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };
  const handleCIDSign = async () => {
    try {
      // Create an object to represent your query parameters
      const queryParams = new URLSearchParams({
        cid: selectedCID,
      });

      // Append the query parameters to the base URL
      const urlWithParams = `/api/examples/sign_cid?${queryParams.toString()}`;

      try {
        const response = await fetch(urlWithParams);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Process the data received from the API
        console.log(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    } catch (error) {
      console.error("An error occurred while uploading the file:", error);
    }
  };

  const handleFileUpload = async () => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/examples/sign_document", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("File uploaded successfully.");
          // You can perform additional actions here upon successful upload.
          const json = await response.json();
          if (json.content) {
            setContent(json.content);
            setSignedPdfURL(json.signedPdfURL);
          }
        } else {
          console.error("File upload failed.");
        }
      } else {
        console.error("No file selected.");
      }
    } catch (error) {
      console.error("An error occurred while uploading the file:", error);
    }
  };

  // If session exists, display content
  return (
    <Layout>
      <h1>Protected Page</h1>
      <p>
        <strong>{content ?? "\u00a0"}</strong>

        <div>
          <h2>File Upload</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload</button>
        </div>

        <div>
          <h2>PDF Viewer</h2>
          <iframe
            src={signedPdfURL} // Use the signedPdfURL in the iframe source
            width="100%"
            height="100%"
            title="Signed PDF"
          ></iframe>
          <div>
            <input type="text" onChange={handleCIDChange} />
            <button onClick={handleCIDSign}>Sign Doc</button>
          </div>
        </div>
      </p>
    </Layout>
  );
}
