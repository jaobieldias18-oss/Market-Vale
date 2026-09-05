import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Permissão negada." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { user_id?: string };
  if (!body.user_id) {
    return NextResponse.json({ error: "Usuário inválido." }, { status: 400 });
  }

  if (body.user_id === user.id) {
    return NextResponse.json(
      { error: "Você não pode excluir a própria conta." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: target } = await admin.auth.admin.getUserById(body.user_id);
  if (!target?.user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  if (target.user.role === "admin") {
    return NextResponse.json(
      { error: "Não é possível excluir outro administrador." },
      { status: 400 },
    );
  }

  const { error } = await admin.auth.admin.deleteUser(body.user_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}