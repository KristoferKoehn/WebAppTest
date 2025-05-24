"use client"
import { useState } from 'react';

export default function MyFormPage() {
  const [name, setName] = useState('');
  const [heading, setHeading] = useState("✨ Welcome to MyForm ✨");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setHeading("✨ YAAAY!! ✨");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-fit w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">{heading}</h1>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter your name"
              className="border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg py-2 font-semibold hover:bg-indigo-700 transition"
            >
              Submit
            </button>
          </form>
        ) : (
          <div className="text-lg text-gray-700">
            <p className="mb-4">Thanks, <strong>{name}</strong>!</p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
              }}
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              Submit another name
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
