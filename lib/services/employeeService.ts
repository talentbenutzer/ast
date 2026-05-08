import { Employee } from "../types";
import { supabase } from "../supabase";

const EMPLOYEES_KEY = "ast_employees";
const ACTIVE_EMPLOYEE_KEY = "ast_active_employee";

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "1", name: "Eddy", createdAt: new Date().toISOString() },
  { id: "2", name: "Kay", createdAt: new Date().toISOString() },
  { id: "3", name: "Jazz", createdAt: new Date().toISOString() },
];

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem(EMPLOYEES_KEY);
      if (!stored) {
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
        return DEFAULT_EMPLOYEES;
      }
      return JSON.parse(stored);
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
    return data as Employee[];
  },

  createEmployee: async (name: string): Promise<Employee> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const employees = await employeeService.getEmployees();
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
      };
      const updated = [...employees, newEmployee];
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
      return newEmployee;
    }

    const newEmployee = {
      name,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(newEmployee)
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
    return data as Employee;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const employees = await employeeService.getEmployees();
      const updated = employees.filter((e) => e.id !== id);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
      
      const active = employeeService.getActiveEmployee();
      if (active?.id === id) {
        localStorage.removeItem(ACTIVE_EMPLOYEE_KEY);
      }
      return;
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }

    const active = employeeService.getActiveEmployee();
    if (active?.id === id) {
      localStorage.removeItem(ACTIVE_EMPLOYEE_KEY);
    }
  },

  getActiveEmployee: (): Employee | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(ACTIVE_EMPLOYEE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setActiveEmployee: (employee: Employee | null): void => {
    if (typeof window === "undefined") return;
    if (employee) {
      localStorage.setItem(ACTIVE_EMPLOYEE_KEY, JSON.stringify(employee));
    } else {
      localStorage.removeItem(ACTIVE_EMPLOYEE_KEY);
    }
  },
};
