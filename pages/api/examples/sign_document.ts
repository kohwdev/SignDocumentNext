// This is an example of to protect an API route

import { auth } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs'
import nodeSignPDF from 'node-signpdf'
import { Web3Storage, File } from 'web3.storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth(req, res)

  if (session) {
    let pdfBuffer = req.body
    pdfBuffer = nodeSignPDF.plainAddPlaceholder({
        pdfBuffer,
        reason: 'I have reviewed it.',
        signatureLength: 1612,
    });
    
    const signedPdf = nodeSignPDF.default.sign(
        pdfBuffer,
        fs.readFileSync('certificate.p12'),
        {passphrase:"1234"}
      );
    
    const token = process.env.WEB3_STORAGE_TOKEN || "<NOT SET>"
  
    const storage = new Web3Storage({ token })
    const cid = await storage.put([new File([signedPdf], "signedPdf")])

    return res.send({
      content:
        `CID:${cid} This is protected content. You can access this content because you are signed in.`
    })
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  })
}
