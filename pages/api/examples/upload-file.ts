import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return;
    }

    // parse form with a Promise wrapper
    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

    console.log("------");
    console.log(data);
    console.log("------");
    console.log(data.files.resume);
    console.log("------");

    let buffer = fs.readFileSync(data.files.file[0].filepath);

    fs.writeFileSync("/Users/stevehorn/Downloads/file.pdf", buffer);

    res.status(200).json(data);
}
