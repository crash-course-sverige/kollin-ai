import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateAssessment, getUserAssessments } from "@/lib/actions/assessment-actions";

/**
 * POST handler to save user assessment
 * This is a transitional API that uses the server action internally
 * @deprecated Use server action createOrUpdateAssessment directly instead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a FormData object from the JSON
    const formData = new FormData();
    formData.append('user_id', body.user_id);
    formData.append('node_id', body.node_id);
    formData.append('assessment', body.assessment);
    
    // Call the server action
    const result = await createOrUpdateAssessment(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assessment API:", error);
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred while processing the assessment"
    }, { status: 500 });
  }
}

/**
 * GET handler to retrieve user assessments
 * This is a transitional API that uses the server action internally
 * @deprecated Use server action getUserAssessments directly instead
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || searchParams.get("user_id");
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }
    
    // Call the server action
    const result = await getUserAssessments(userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in getting assessments:", error);
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred while retrieving assessments"
    }, { status: 500 });
  }
} 