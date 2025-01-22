"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Upload } from "lucide-react";

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
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [newStudent, setNewStudent] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (!file) return;

    if (!file.name.endsWith(".txt") && !file.name.endsWith(".csv")) {
      setUploadError("Please upload a .txt or .csv file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split(/\r?\n/).filter((line) => line.trim());

        const newStudents: Student[] = lines.map((name, index) => ({
          id: Math.max(0, ...students.map((s) => s.id)) + index + 1,
          name: name.trim(),
        }));

        setStudents((prevStudents) => {
          const existingNames = new Set(
            prevStudents.map((s) => s.name.toLowerCase()),
          );

          const uniqueNewStudents = newStudents.filter(
            (student) => !existingNames.has(student.name.toLowerCase()),
          );

          return [...prevStudents, ...uniqueNewStudents];
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        setUploadError("Error processing file. Please check the format.");
        console.error("Error processing file:", error);
      }
    };

    reader.onerror = () => {
      setUploadError("Error reading file");
    };

    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const toggleAttendance = (studentId: number): void => {
    setAttendanceData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      if (!newData[selectedDate]) {
        newData[selectedDate] = {};
      }
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
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <form onSubmit={addStudent} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add new student"
                  value={newStudent}
                  onChange={handleNewStudentChange}
                  className="flex-1"
                />
                <Button type="submit">Add Student</Button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                onClick={handleUploadClick}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Students
              </Button>
            </div>
          </div>

          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

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
