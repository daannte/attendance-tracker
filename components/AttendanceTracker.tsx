"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "lucide-react";

interface Student {
  id: number;
  name: string;
}

interface AttendanceRecord {
  [studentId: number]: boolean;
}

interface AttendanceData {
  [date: string]: AttendanceRecord;
}

interface StorageData {
  attendanceData: AttendanceData;
  students: Student[];
}

const STORAGE_KEY = "attendanceTrackerData";

const AttendanceTracker: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Alice Smith" },
    { id: 2, name: "Bob Johnson" },
    { id: 3, name: "Carol Williams" },
  ]);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [newStudent, setNewStudent] = useState<string>("");

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStorageData = (): void => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData: StorageData = JSON.parse(savedData);
          setAttendanceData(parsedData.attendanceData);
          setStudents(parsedData.students);
        } catch (error) {
          console.error("Error loading data from localStorage:", error);
        }
      }
    };

    loadStorageData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const saveStorageData = (): void => {
      const dataToSave: StorageData = {
        attendanceData,
        students,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    };

    saveStorageData();
  }, [attendanceData, students]);

  const toggleAttendance = (studentId: number): void => {
    setAttendanceData((prev) => {
      // Create deep copy of the previous state
      const newData = JSON.parse(JSON.stringify(prev));
      // Initialize the date object if it doesn't exist
      if (!newData[selectedDate]) {
        newData[selectedDate] = {};
      }
      // Toggle the attendance
      newData[selectedDate][studentId] = !newData[selectedDate][studentId];
      return newData;
    });
  };

  const addStudent = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newStudent.trim()) {
      const newStudentObj: Student = {
        id: Math.max(0, ...students.map((s) => s.id)) + 1,
        name: newStudent.trim(),
      };
      setStudents((prev) => [...prev, newStudentObj]);
      setNewStudent("");
    }
  };

  const isPresent = (studentId: number): boolean => {
    return attendanceData[selectedDate]?.[studentId] || false;
  };

  const getPresentCount = (): number => {
    return Object.values(attendanceData[selectedDate] || {}).filter(Boolean)
      .length;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  const handleNewStudentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewStudent(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Class Attendance
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStudent} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Add new student"
              value={newStudent}
              onChange={handleNewStudentChange}
              className="flex-1"
            />
            <Button type="submit">Add Student</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPresent(student.id)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isPresent(student.id) ? "Present" : "Absent"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={isPresent(student.id) ? "outline" : "default"}
                      onClick={() => toggleAttendance(student.id)}
                    >
                      Mark {isPresent(student.id) ? "Absent" : "Present"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Present: {getPresentCount()} / {students.length} students
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;
