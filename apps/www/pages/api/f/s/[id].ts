/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { DdfForms } from '../../../../forms'
import { Logger, Res } from '../../../../lib/api'
import isValidFormId = DdfForms.isValidFormId
import getFormSchemaFromId = DdfForms.getFormSchemaFromId


/**
 * Form submission functionality JSON api
 * directory & file name explanation `f = form`, `s = submit`, `[id] = form ID`
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
function formHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: {
      id, ...params
    },
    method,
  } = req

  // const json = Res.Error.createSessionCookie
  // Logger.traceError(json, error)

  // Ensure Form ID exists
  if (!isValidFormId(id)) {
    return res.status(400).end(`Bad Request`)
  }

  const formSchema = getFormSchemaFromId(id)


  switch (method) {
    case 'GET':
      // Get data from your database
      res.status(200).json({ id, name: `User ${id}` })
      break
    case 'PUT':
      // Update or create data in your database
      res.status(200).json({ id, name: name || `User ${id}` })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default formHandler
