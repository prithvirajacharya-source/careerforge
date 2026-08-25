import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  const authHeader =
    request.headers.get(
      "authorization"
    );

  if (
    !authHeader?.startsWith(
      "Bearer "
    )
  ) {
    return NextResponse.json(
      {
        error:
          "A Bearer authorization token is required.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    id,
  } = await context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      {
        error:
          "Invalid intelligence suggestion id.",
      },
      {
        status: 400,
      }
    );
  }

  const suggestionId =
    Number(id);

  if (
    !Number.isSafeInteger(
      suggestionId
    ) ||
    suggestionId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid intelligence suggestion id.",
      },
      {
        status: 400,
      }
    );
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    return NextResponse.json(
      {
        error:
          "Supabase environment variables are missing.",
      },
      {
        status: 500,
      }
    );
  }

  const supabase =
    createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization:
              authHeader,
          },
        },
      }
    );

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return NextResponse.json(
      {
        error:
          "Authenticated admin session required.",
      },
      {
        status: 401,
      }
    );
  }

  if (
    user.app_metadata?.role !==
    "admin"
  ) {
    return NextResponse.json(
      {
        error:
          "SEKUR admin access required.",
      },
      {
        status: 403,
      }
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "approve_intelligence_suggestion",
    {
      p_suggestion_id:
        suggestionId,
    }
  );

  if (error) {
    const status =
      error.code === "42501"
        ? 403
        : error.code === "P0002"
          ? 404
          : error.code === "P0001"
            ? 409
            : 500;

    return NextResponse.json(
      {
        error:
          error.message ||
          "Could not approve intelligence suggestion.",
      },
      {
        status,
      }
    );
  }

  return NextResponse.json(
    data,
    {
      status: 200,
    }
  );
}
