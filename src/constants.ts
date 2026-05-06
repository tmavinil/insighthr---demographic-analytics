import { Employee } from "./types";

export const SAMPLE_DATA: Employee[] = [
  { id: "1", name: "Alice Johnson", department: "Engineering", location: "New York", tenureYears: 4, gender: "Female", age: 29, hireDate: "2020-01-15", status: "Active" },
  { id: "2", name: "Bob Smith", department: "Marketing", location: "San Francisco", tenureYears: 2, gender: "Male", age: 34, hireDate: "2022-03-10", status: "Active" },
  { id: "3", name: "Charlie Davis", department: "Sales", location: "London", tenureYears: 7, gender: "Non-binary", age: 41, hireDate: "2017-06-22", status: "Active" },
  { id: "4", name: "Diana Prince", department: "Engineering", location: "New York", tenureYears: 1, gender: "Female", age: 25, hireDate: "2023-08-01", status: "Active" },
  { id: "5", name: "Ethan Hunt", department: "Operations", location: "New York", tenureYears: 5, gender: "Male", age: 38, hireDate: "2019-11-12", status: "Active" },
  { id: "6", name: "Fiona Gallagher", department: "Marketing", location: "San Francisco", tenureYears: 3, gender: "Female", age: 31, hireDate: "2021-02-28", status: "Active" },
  { id: "7", name: "George Miller", department: "Engineering", location: "London", tenureYears: 2, gender: "Male", age: 27, hireDate: "2022-10-15", status: "Active" },
  { id: "8", name: "Hannah Abbott", department: "Sales", location: "London", tenureYears: 6, gender: "Female", age: 45, hireDate: "2018-04-05", status: "Active" },
  { id: "9", name: "Ian Wright", department: "Engineering", location: "Tokyo", tenureYears: 3, gender: "Male", age: 33, hireDate: "2021-05-20", terminationDate: "2024-02-15", terminationType: "Voluntary", status: "Terminated" },
  { id: "10", name: "Julia Roberts", department: "HR", location: "Berlin", tenureYears: 1, gender: "Female", age: 28, hireDate: "2023-01-10", terminationDate: "2024-01-05", terminationType: "Involuntary", status: "Terminated" },
  { id: "11", name: "Kevin Hart", department: "Marketing", location: "Tokyo", tenureYears: 4, gender: "Male", age: 40, hireDate: "2020-09-12", terminationDate: "2024-03-22", terminationType: "Voluntary", status: "Terminated" },
];

export const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Operations", "Product", "Human Resources"];
export const LOCATIONS = ["New York", "San Francisco", "London", "Berlin", "Tokyo"];
