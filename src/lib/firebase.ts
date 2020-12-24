import firebase from 'firebase/app'
import 'firebase/auth'
// import 'firebase/analytics'

export {
  firebase
}

/**
 * @see https://firebase.google.com/docs/firestore/storage-size
 *
 * String sizes are calculated as the number of UTF-8 encoded bytes + 1.
 * - For example:
 *    - The collection ID `tasks` uses 5 bytes + 1 byte, for a total of 6 bytes.
 *    - The field name `description` uses 11 bytes + 1 byte, for a total of 12 bytes.
 *
 * Document ID size is the string size for a string ID or 8 bytes for an integer ID.
 *    - String ID: size of string
 *    - Integer ID: 8 bytes
 *
 * The size of a document name is the sum of:
 *    - The size of each collection ID and document ID in the path to the document
 *    - 16 additional bytes
 *
 *
 * Field *VALUE* size based on Data Type
 * |  Type                  |  Size
 * |—————————————————————————————————————————————————————————————————————————
 * |  Array                 |  The sum of the sizes of its values
 * |  Boolean               |  1 byte
 * |  Bytes                 |  Byte length
 * |  Date and time         |  8 bytes
 * |  Floating-point number |  8 bytes
 * |  Geographical point    |  16 bytes
 * |  Integer               |  8 bytes
 * |  Map                   |  The map size, calculated same way as document size
 * |  Null                  |  1 byte
 * |  Reference             |  The document name size
 * |  Text string           |  Number of UTF-8 encoded bytes + 1
 * |—————————————————————————————————————————————————————————————————————————
 *
 * For example, a boolean field named done would use 6 bytes:
 *    - 5 bytes for the done field name
 *    - 1 byte for the boolean value
 *
 * The size of a document is the sum of:
 *    - The document name size
 *    - The sum of the string size of each field name
 *    - The sum of the size of each field value
 *    - 32 additional bytes
 *
 *
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/**
 * Must be called when the application first initializes/loads
 */
export const initFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)
  }
}