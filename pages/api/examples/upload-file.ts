import { NextApiRequest, NextApiResponse } from 'next';
import * as path from "path";
import * as fs from "fs";
import formidable, { File } from 'formidable';
// File is successfully submitted here from /protected. Next step is to parse multi-part form data.
// TOOD: https://github.com/gapon2401/upload-files-nextjs/blob/master/pages/api/upload.ts
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

}
