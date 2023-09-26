// This is an example of to protect an API route

import { auth } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"

import fs from 'fs'
import {plainAddPlaceholder}  from 'node-signpdf'
import nodesignpdf  from 'node-signpdf'
import { Web3Storage, File, CIDString} from 'web3.storage'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth(req, res)

  if (session) {

    const token = process.env.WEB3_STORAGE_TOKEN || "<NOT SET>"
    const storage = new Web3Storage({ token })
    console.log('get web3storage instance')
    let original_cid = req.query.cid as CIDString
    console.log('cid to lookup')
    let web3response = await storage.get(original_cid)
    if(web3response != null){
    
      const files = await web3response.files()
      let pdfBuffer = null
      for (const file of files) {
        console.log(`${file.cid} -- ${file.name} -- ${file.size}`)
        pdfBuffer = await file.arrayBuffer()
      }

      if (pdfBuffer != null) {

      
      // Convert ArrayBuffer to Buffer
      pdfBuffer = Buffer.from(pdfBuffer);

      console.log('cid afte storage.get')
       pdfBuffer = plainAddPlaceholder({
          pdfBuffer,
          reason: 'I have reviewed it.',
          signatureLength: 1612,
      });
    
    console.log('after plainAddPlaceholder')
    
    const signedPdf = nodesignpdf.sign(
        pdfBuffer,
        fs.readFileSync('certificate.p12'),
        {passphrase:"1234"}
      );
      console.log('after sign')
    
    const cid = await storage.put([new File([signedPdf], "signedPdf_signedPdf")])

    console.log('after put')
    console.log('cid:'+cid)
    
    return res.send({
      content:
      `CID:${cid} This is protected content. You can access this content because you are signed in.`
    })
  }
  }
  throw new Error("error when trying to sign PDF")
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  })
}
