import { googlecalendar } from "@corsair-dev/googlecalendar"
import { gmail } from "@corsair-dev/gmail"
import { createCorsair } from "corsair"

import { pool } from "@/db"

function getKek() {
  const kek = process.env.CORSAIR_KEK
  if (!kek) {
    throw new Error("CORSAIR_KEK is not set")
  }
  return kek
}

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: pool,
  kek: getKek(),
  multiTenancy: true,
})
