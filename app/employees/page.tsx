"use client";

import { useEffect, useState } from "react";
import { employeeService } from "@/lib/services/employeeService";
import { serialNumberService } from "@/lib/services/serialNumberService";
import { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    employeeService.getEmployees().then(setEmployees);
    setActiveEmployee(employeeService.getActiveEmployee());
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newEmp = await employeeService.createEmployee(newName.trim());
    const emps = await employeeService.getEmployees();
    setEmployees(emps);
    setNewName("");
    if (!activeEmployee) {
      handleSetActive(newEmp);
    }
  };

  const handleDelete = async (id: string) => {
    await employeeService.deleteEmployee(id);
    const emps = await employeeService.getEmployees();
    setEmployees(emps);
    setActiveEmployee(employeeService.getActiveEmployee());
  };

  const handleSetActive = (employee: Employee) => {
    employeeService.setActiveEmployee(employee);
    setActiveEmployee(employee);
  };

  const handleDeactivate = (employee: Employee) => {
    if (activeEmployee?.id === employee.id) {
      employeeService.setActiveEmployee(null);
      setActiveEmployee(null);
    } else {
      handleSetActive(employee);
    }
  };

  const getSerialCount = (employeeName: string) => {
    const serials = serialNumberService.getSerialNumbers();
    return serials.filter((s) => s.createdBy === employeeName).length;
  };

  return (
    <div>
      {/* Header row */}
      <div className="px-6 md:px-[90px] py-8 md:py-10">
        <div className="flex flex-col md:grid md:grid-cols-7 md:items-baseline gap-6 md:gap-4">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">Mitarbeiter</h2>
          </div>
          <form onSubmit={handleCreate} className="md:col-span-5 flex flex-col sm:flex-row md:items-baseline gap-4">
            <input
              type="text"
              placeholder="Neuer Mitarbeiter..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-transparent text-xl md:text-2xl font-light text-muted placeholder-muted/50 outline-none flex-1 min-w-0"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="border border-foreground px-6 py-3 md:px-4 md:py-1.5 text-sm hover:bg-foreground hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              + hinzufügen
            </button>
          </form>
        </div>
      </div>

      {/* Employee list */}
      <div>
        {employees.map((emp) => {
          const isActive = activeEmployee?.id === emp.id;
          const serialCount = getSerialCount(emp.name);

          return (
            <div key={emp.id} className="border-t border-border">
              <div
                className={`px-6 md:px-[90px] py-6 md:py-4 flex flex-col md:grid md:grid-cols-7 md:items-baseline gap-4 ${
                  !isActive ? "opacity-40" : ""
                }`}
              >
                {/* Name – col 1 */}
                <div className="text-lg font-bold md:col-span-1">
                  {emp.name}
                </div>

                {/* Status – col 2 */}
                <button
                  onClick={() => handleDeactivate(emp)}
                  className="text-sm text-muted hover:text-foreground transition-colors text-left md:col-span-1"
                >
                  {isActive ? "aktiv" : "inaktiv"}
                </button>

                {/* Serial count – cols 3-5 */}
                <div className="md:col-span-3 text-sm text-muted">
                  Angelegte Nummern: {serialCount}
                </div>

                {/* Actions – cols 6-7 */}
                <div className="flex gap-6 md:gap-4 md:col-span-2">
                  <button
                    onClick={() => handleSetActive(emp)}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    löschen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div className="border-t border-border" />
      </div>
    </div>
  );
}
