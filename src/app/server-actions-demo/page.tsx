import { UserProgress } from '@/components/courses/knowledge-graph/user-progress';
import { AssessmentForm } from '@/components/courses/knowledge-graph/assessment-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: 'Server Actions Demo',
  description: 'A demonstration of Next.js server actions',
};

// Example concept for the demo
const demoNode = {
  id: 'limits-intro',
  name: 'Introduction to Limits',
  description: 'Understanding the concept of limits in calculus',
  category: 'limits',
  difficulty: 'intermediate',
};

export default function ServerActionsDemo() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Server Actions Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-card rounded-lg border p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Server Action Form Example</h2>
            <p className="mb-6 text-muted-foreground">
              This demonstrates using server actions directly with a form. Form data is processed on the 
              server without traditional API routes.
            </p>
            
            <div className="border rounded-md p-4 bg-background">
              <h3 className="text-lg font-medium mb-2">{demoNode.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{demoNode.description}</p>
              
              <AssessmentForm 
                node={demoNode} 
                userId="demo-user-1" 
                onComplete={(success) => console.log('Assessment completed:', success)} 
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-lg border p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Server Action Data Fetching</h2>
            <p className="mb-6 text-muted-foreground">
              This demonstrates using server actions to fetch data from the server and display it in a client component.
            </p>
            
            <UserProgress userId="demo-user-1" />
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
        
        <Tabs defaultValue="form">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Form Submission</TabsTrigger>
            <TabsTrigger value="data">Data Fetching</TabsTrigger>
            <TabsTrigger value="server">Server Action</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {`// Client component using server action
'use client';

async function handleSubmit(formData: FormData) {
  // Call the server action directly
  const result = await createOrUpdateAssessment(formData);
  
  if (result.success) {
    // Handle success
  }
}`}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              The form calls the server action directly instead of using fetch() to an API endpoint.
            </p>
          </TabsContent>
          
          <TabsContent value="data">
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {`// Client component using server action for data fetching
'use client';

useEffect(() => {
  async function fetchData() {
    // Call the server action directly
    const result = await getUserAssessments(userId);
    
    if (result.success) {
      setData(result.assessments);
    }
  }
  
  fetchData();
}, [userId]);`}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              The component calls the server action directly to fetch data, without an API route.
            </p>
          </TabsContent>
          
          <TabsContent value="server">
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {`// Server action definition
'use server';

import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createOrUpdateAssessment(formData: FormData) {
  // Server-side code that runs when the action is called
  // Can access database, file system, etc.
  
  // Revalidate paths that use this data
  revalidatePath('/some-path');
  
  return { success: true };
}`}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              The server action runs on the server and can access server-only resources.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 