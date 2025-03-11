"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap, 
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock courses data (in production, this would come from a server component)
const courses = [
  {
    id: "mathematics-101",
    title: "Mathematics 101",
    icon: GraduationCap,
  },
  {
    id: "calculus-fundamentals",
    title: "Calculus Fundamentals",
    icon: GraduationCap,
  },
  {
    id: "graph-theory",
    title: "Graph Theory",
    icon: Network,
  },
];

interface NavItemProps {
  isActive: boolean;
  href: string;
  label: string;
  icon: React.ElementType;
  children?: React.ReactNode;
}

export function CoursesSidebar() {
  const pathname = usePathname();
  const [expandedCourses, setExpandedCourses] = useState(true);

  const toggleCourses = () => {
    setExpandedCourses(!expandedCourses);
  };

  const getIsActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="pb-12 pt-4">
      <div className="px-3 py-2">
        <div className="mb-4 px-4 text-lg font-semibold tracking-tight">
          Courses
        </div>
        <div className="space-y-1">
          <NavItem
            isActive={pathname === "/courses"}
            href="/courses"
            label="All Courses"
            icon={BookOpen}
          />
          
          <div className="py-2">
            <Button
              variant="ghost"
              className="w-full justify-between font-normal"
              onClick={toggleCourses}
            >
              <div className="flex items-center">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>My Courses</span>
              </div>
              {expandedCourses ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedCourses && (
              <div className="pl-6 pt-2">
                {courses.map((course) => (
                  <NavItem
                    key={course.id}
                    isActive={getIsActive(`/courses/${course.id}`)}
                    href={`/courses/${course.id}`}
                    label={course.title}
                    icon={course.icon}
                  >
                    {getIsActive(`/courses/${course.id}`) && (
                      <div className="pl-6 pt-2 space-y-1">
                        <SubNavItem
                          isActive={pathname === `/courses/${course.id}`}
                          href={`/courses/${course.id}`}
                          label="Overview"
                        />
                        <SubNavItem
                          isActive={pathname === `/courses/${course.id}/knowledge-graph`}
                          href={`/courses/${course.id}/knowledge-graph`}
                          label="Knowledge Graph"
                        />
                      </div>
                    )}
                  </NavItem>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ isActive, href, label, icon: Icon, children }: NavItemProps) {
  return (
    <div className="mb-1">
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start font-normal"
      >
        <Link href={href} className="w-full">
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
      {children}
    </div>
  );
}

function SubNavItem({ 
  isActive, 
  href, 
  label 
}: { 
  isActive: boolean; 
  href: string; 
  label: string;
}) {
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className="w-full justify-start font-normal text-sm h-9"
    >
      <Link href={href} className="w-full">
        {label}
      </Link>
    </Button>
  );
} 