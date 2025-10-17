import { NextRequest, NextResponse } from "next/server";
import { studentService } from "@/lib/services/student.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = id;
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const notesData = await studentService.getStudentNotes(
      studentId,
      limit,
      offset
    );

    return NextResponse.json(notesData);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Create a server-side Supabase client
    const supabase = createClient();

    // 2. Securely get the user session from the cookies
    const { data: { user } } = await (await supabase).auth.getUser();

    // 3. Check if the user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = user.id; // <-- This is the secure user UUID

    const { id: studentId } = params;
    const { note } = await request.json();

    if (!note?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    // 4. Use the secure user ID to add the note
    const newNote = await studentService.addStudentNote(
      studentId,
      note.trim(),
      currentUserId
    );

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}