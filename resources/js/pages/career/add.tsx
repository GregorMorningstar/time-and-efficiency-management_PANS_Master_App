import React from 'react';
import CareerNipInput from '../../components/card/career-nip-input';

export default function AddCareerPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold">Dodaj przebieg kariery</h1>
      <CareerNipInput />
    </div>
  );
}
