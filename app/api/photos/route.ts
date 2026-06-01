import { NextResponse } from "next/server";
import { readPhotos } from "@/lib/adminPhotos";

export async function GET() {
  return NextResponse.json(await readPhotos());
}
