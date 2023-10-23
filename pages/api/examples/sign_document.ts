// This is an example of to protect an API route

import { auth } from "auth";
import type { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import { plainAddPlaceholder } from "node-signpdf";
import nodesignpdf from "node-signpdf";

import { Web3Storage, File } from "web3.storage";

import { IncomingForm } from "formidable";

const { PDFDocument } = require("pdf-lib");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth(req, res);

  if (session) {
    const data: any = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    let pdfBuffer = fs.readFileSync(data.files.file[0].filepath);

    pdfBuffer = plainAddPlaceholder({
      pdfBuffer,
      reason: "I have reviewed it.",
      signatureLength: 1612,
    });

    console.log("add plainAddPlaceholder");
    const signedPdf = nodesignpdf.sign(
      pdfBuffer,
      fs.readFileSync("certificate.p12"),
      { passphrase: "1234" }
    );

    // Create a new PDFDocument from the signed PDF
    const pdfDoc = await PDFDocument.load(signedPdf);

    // Continue with adding the image
    const page = pdfDoc.getPage(0); // Get the first page or the specific page you want to add the image to
    const imageBytes = fs.readFileSync(
      "/Users/woonkoh/Desktop/tublian/SignDocumentNext/pages/api/examples/signature.png"
    ); // Replace with the correct path to your signature image

    const image = await pdfDoc.embedPng(imageBytes);
    const { width, height } = image.size();
    const imageOptions = {
      x: 100, // Adjust the X-coordinate
      y: 100, // Adjust the Y-coordinate
      width: 200, // Adjust the width
      height: 50, // Adjust the height
    };

    page.drawImage(image, imageOptions);

    // Save the final PDF with the added image
    const finalPdfBuffer = await pdfDoc.save();

    console.log("after sign");
    const token = process.env.WEB3_STORAGE_TOKEN || "<NOT SET>";

    console.log("after web3.storage token");
    const storage = new Web3Storage({ token });
    console.log("after web3.storage instantiated");
    const cid = await storage.put([new File([finalPdfBuffer], "signedPdf")]);

    console.log("cid:" + cid);

    const signedPdfURL = `https://ipfs.io/ipfs/${cid}/signedPdf`;

    return res.send({
      content: `CID:${cid} This is protected content. You can access this content because you are signed in.`,
      signedPdfURL,
    });
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
