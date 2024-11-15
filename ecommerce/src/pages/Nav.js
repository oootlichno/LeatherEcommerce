import React from 'react';
import { Link } from "react-router-dom";

const style = { margin: "1rem", padding: "0.5rem", fontSize: '30px', color: 'rgb(80, 140, 155)', marginBottom: '10px' };

export default function Nav() {
  return (
    <nav>
      <Link style={style} to="/">Home</Link>
    </nav>
  );
}
