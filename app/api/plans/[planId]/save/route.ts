import { handleSavePlan } from "../../../../../lib/save-plan";

export async function POST(
  request: Request,
  context: { params: Promise<{ planId: string }> },
): Promise<Response> {
  const { planId } = await context.params;
  return handleSavePlan(request, planId);
}
