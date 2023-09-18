import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

export default function ProtectedPage() {
  const { data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState()

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/examples/protected")
      const json = await res.json()
      if (json.content) {
        setContent(json.content)
      }
    }
    fetchData()
  }, [session])

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  const handleFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/examples/sign_document', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('File uploaded successfully.');
          // You can perform additional actions here upon successful upload.
          const json = await response.json()
          if (json.content) {
            setContent(json.content)
          }          
        } else {
          console.error('File upload failed.');
        }
      } else {
        console.error('No file selected.');
      }
    } catch (error) {
      console.error('An error occurred while uploading the file:', error);
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

      </p>
    </Layout>
  )
}
