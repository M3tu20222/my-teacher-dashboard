"use client";
import "@/app/globals.css";
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { Trash2, UserPlus, Moon, Sun, Download, Upload, Edit } from 'lucide-react';

interface Score {
  value: number;
  date: string;
}

interface Student {
  _id: string;
  number: string;
  name: string;
  class: string;
  scores: Score[];
}

interface User {
  id: string;
  name: string;
  role: string;
  subject: string;
}

export default function TeacherDashboard({ user }: { user: User }) {
  if (!user) {
    return <div>Loading...</div>;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const [randomStudents, setRandomStudents] = useState<Student[]>([]);
  const [isRandomStudentsDialogOpen, setIsRandomStudentsDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ number: '', name: '', class: '' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };
  

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/students?export=csv', { method: 'GET' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('CSV upload failed');

      const result = await response.json();
      alert(result.message);
      await fetchStudents();
    } catch (error) {
      console.error('CSV upload error:', error);
    }
  };

  const handleScoreChange = (newScore: number) => {
    setTempScore(newScore);
  };

  const saveScore = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: tempScore, date: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to save score');

      await fetchStudents();
      setActiveStudent(null);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const calculateAvgScore = (scores: Score[]): number => {
    console.log('Scores received:', scores);
    if (!scores || scores.length === 0) return 0;
    const validScores = scores.filter((score) => score && score.value !== undefined);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, score) => {
      console.log('Adding score value:', score.value);
      return acc + score.value;
    }, 0);
    return Math.round(sum / validScores.length);
  };
  
  

  const getAvailableScoreCount = (scores: Score[]): number => {
    if (scores.length === 0) return 4;
    if (scores.length < 4) return 4;
    if (scores.length === 4) return 8;
    if (scores.length < 8) return 8;
    if (scores.length === 8) return 12;
    if (scores.length < 12) return 12;
    return 16;
  };

  const filteredStudents = selectedClass === "All" 
    ? students 
    : students.filter(student => student.class === selectedClass);

  const classPerformanceData = [
    { name: '10A', avgScore: calculateAvgScore(students.filter(s => s.class === '10A').flatMap(s => s.scores)) },
    { name: '10B', avgScore: calculateAvgScore(students.filter(s => s.class === '10B').flatMap(s => s.scores)) },
    { name: '10C', avgScore: calculateAvgScore(students.filter(s => s.class === '10C').flatMap(s => s.scores)) },
  ];

  const selectRandomStudents = () => {
    const classStudents = students.filter(s => s.class === selectedClass);
    
    // Not almamış öğrencileri filtrele
    const studentsWithoutScores = classStudents.filter(s => s.scores.length === 0);
    
    // Eğer not almamış öğrenci yoksa, tüm öğrenciler arasından seç
    const poolOfStudents = studentsWithoutScores.length > 0 ? studentsWithoutScores : classStudents;
    
    // Rastgele seçim yap
    const randomlySelectedStudents = [];
    const numberOfStudentsToSelect = Math.min(3, poolOfStudents.length);
    
    for (let i = 0; i < numberOfStudentsToSelect; i++) {
      const randomIndex = Math.floor(Math.random() * poolOfStudents.length);
      randomlySelectedStudents.push(poolOfStudents[randomIndex]);
      poolOfStudents.splice(randomIndex, 1); // Seçilen öğrenciyi havuzdan çıkar
    }
    
    setRandomStudents(randomlySelectedStudents);
    setIsRandomStudentsDialogOpen(true);
  };

  const handleAddStudent = async () => {
    if (newStudent.number && newStudent.name && newStudent.class) {
      try {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newStudent, scores: [] }), // scores dizisini ekledik
        });
  
        if (!response.ok) throw new Error('Failed to add student');
  
        await fetchStudents();
        setNewStudent({ number: '', name: '', class: '' });
        setIsAddStudentDialogOpen(false);
      } catch (error) {
        console.error('Error adding student:', error);
      }
    }
  };
  
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditStudentDialogOpen(true);
  };
  const handleUpdateStudent = async () => {
    if (editingStudent) {
      try {
        const response = await fetch(`/api/students/${editingStudent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingStudent.name,
            number: editingStudent.number,
            class: editingStudent.class
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update student');
        }
  
        await fetchStudents();
        setIsEditStudentDialogOpen(false);
        setEditingStudent(null);
      } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
      }
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove student');
      await fetchStudents();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    if (score >= 60) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-card p-6 border-r border-border">
        <h2 className="text-2xl font-bold mb-6">Öğretmen Dashboard</h2>
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.subject} Öğretmen</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="ml-auto"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Temayı Değiştir</span>
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Hoşgeldiniz, {user.name}!</h1>
        
        {/* CSV Import/Export Buttons */}
        <div className="mb-4 flex space-x-2">
          <Button onClick={handleExportCSV} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            CSV Olarak Dışa Aktar
          </Button>
          <Input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="max-w-xs"
            id="csv-upload"
            style={{ display: 'none' }}
          />
          <Button onClick={() => document.getElementById('csv-upload')?.click()} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            CSV Yükle
          </Button>
        </div>
        
        {/* Charts section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sınıf Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Öğrenci Performans Isı Haritası</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <span className="w-24 truncate">{student.name}</span>
                    <div className="flex-1 grid grid-cols-4 gap-1">
                      {student.scores.slice(0, 4).map((score, index) => (
                        <div
                          key={index}
                          className={`h-6 ${getPerformanceColor(score.value)} rounded`}
                          title={`Score ${index + 1}: ${score.value}`}
                        />
                      ))}
                      {Array(4 - student.scores.length).fill(0).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="h-6 bg-muted rounded"
                          title="No score yet"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Not 1</span>
                <span>Not 2</span>
                <span>Not 3</span>
                <span>Not 4</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Öğrenci Listesi</CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={selectRandomStudents} size="sm" variant="outline">
                Rastgele Öğrenci Seç
              </Button>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tüm Sınıflar</SelectItem>
                  <SelectItem value="10A">8A</SelectItem>
                  <SelectItem value="10B">6A</SelectItem>
                  <SelectItem value="10C">6C</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddStudentDialogOpen(true)} size="sm" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Öğrenci Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numara</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Sınıf</TableHead>
                  <TableHead>Ort Not</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.number}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{calculateAvgScore(student.scores)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: getAvailableScoreCount(student.scores) }).map((_, index) => (
                          <Dialog key={index}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0"
                              >
                                {student.scores[index]?.value ?? '-'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{student.name}'nın Not Detayları</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={student.scores}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="date"
                                      tickFormatter={(isoString) => format(new Date(isoString), "dd/MM/yy")}
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                      labelFormatter={(isoString) => format(new Date(isoString), "dd/MM/yyyy")}
                                      formatter={(value) => [`${value}`, "Score"]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              {index === student.scores.length && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Slider
                                    value={[tempScore]}
                                    onValueChange={([value]) => handleScoreChange(value)}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                  />
                                  <Button
                                    onClick={() => saveScore(student._id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Save {tempScore}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveStudent(student._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Random Students Dialog */}
      <Dialog open={isRandomStudentsDialogOpen} onOpenChange={setIsRandomStudentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rastgele Seçilen Öğrenciler</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ul>
              {randomStudents.map((student) => (
                <li key={student._id} className="mb-2">
                  {student.name} - Notları: {student.scores.length}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Öğrenci Ekle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-number">Öğrenci Numarası</Label>
                <Input
                  id="student-number"
                  value={newStudent.number}
                  onChange={(e) => setNewStudent({ ...newStudent, number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-name">Öğrenci İsim</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Sınıf</Label>
                <Select
                  value={newStudent.class}
                  onValueChange={(value) => setNewStudent({ ...newStudent, class: value })}
                >
                  <SelectTrigger id="student-class">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10A">8A</SelectItem>
                    <SelectItem value="10B">6A</SelectItem>
                    <SelectItem value="10C">6C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button onClick={handleAddStudent}>Öğrenci Ekle</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Öğrenci Düzenle</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-number">Öğrenci Numarası</Label>
                  <Input
                    id="edit-student-number"
                    value={editingStudent.number}
                    onChange={(e) => setEditingStudent({ ...editingStudent, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student-name">Öğrenci İsim</Label>
                  <Input
                    id="edit-student-name"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student-class">Sınıf</Label>
                  <Select
                    value={editingStudent.class}
                    onValueChange={(value) => setEditingStudent({ ...editingStudent, class: value })}
                  >
                    <SelectTrigger id="edit-student-class">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10A">8A</SelectItem>
                      <SelectItem value="10B">6A</SelectItem>
                      <SelectItem value="10C">6C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <Button onClick={handleUpdateStudent}>Öğrenci Düzenle</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
