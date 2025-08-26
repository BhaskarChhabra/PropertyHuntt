import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Property, Hostel & Get Your Dream Place</h1>
       <p>
  Welcome to <span style={{ fontWeight: "bold", color: "#2c3e50" }}>PropertyHuntt</span>, your go-to destination for finding the perfect place — be it a <span style={{ color: "#3498db" }}>cozy hostel</span>, <span style={{ color: "#e74c3c" }}>dream home</span>, or a <span style={{ color: "#f39c12" }}>budget-friendly rental</span>. From <span style={{ color: "#1abc9c" }}>vibrant city life</span> to a <span style={{ color: "#9b59b6" }}>serene retreat</span>, we’ve got you covered. Start your journey today and find the place you’ll love to call home.
</p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>1</h1>
              <h2>Year of Experience</h2>
            </div>
            <div className="box">
              <h1>5</h1>
              <h2>Award Gained</h2>
            </div>
            <div className="box">
              <h1>500+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;
