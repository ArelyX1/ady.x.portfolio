import React, { useState } from 'react';
import './App.css';
import ThreeScene from './three/src/ThreeScene';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error caught in boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong in rendering ThreeScene.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ErrorBoundary>
        <ThreeScene />
      </ErrorBoundary>

      <div className="home">
        <div className="title"> title </div>
        <div className="draw"> draw </div>
        <div className="description"> description </div>
        <div className="media"> media </div>
      </div>

      <div className="skills">
        <div className="technologies"> technologies </div>
        <div className="div5"> cont 5 </div>
      </div>

      <div className="proyects">
        <div className="tree"> cont 6 </div>
      </div>
    </>
  );
}

export default App;
