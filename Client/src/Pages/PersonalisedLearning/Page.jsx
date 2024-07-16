import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Content.css";
import Navbar from "../../Components/Sidebar/Navbar";
import { RingLoader } from "react-spinners";



const Page = () => {
  const [prompttext2, setPromptText2] = useState("");
  const [response, setResponse] = useState("");
  const [response2, setResponse2] = useState("");
  const [imgPrompt, setImgPrompt] = useState([]);
  const [videoPrompt, setVideoPrompt] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [matchingCourseNames, setMatchingCourseNames] = useState([]);

  useEffect(() => {
    const matchingNames = [];

    async function fetchData() {
      try {
        const user = localStorage.getItem("user");
        const userCoursesResponse = await axios.get(
          `http://localhost:4500/student/${user}`
        );
        const userCourses = userCoursesResponse.data.courses;

        const allCoursesResponse = await axios.get(
          "http://localhost:4500/courses"
        );
        const allCourses = allCoursesResponse.data;

        for (const userCourse of userCourses) {
          const matchingCourse = allCourses.find(
            (course) => course._id === userCourse.courseId
          );
          if (matchingCourse) {
            matchingNames.push(matchingCourse.courseName);
          }
        }

        setMatchingCourseNames(matchingNames);
      } catch (err) {
        console.log(err);
      }
    }

    fetchData();

    async function fetchdata2() {
      const apiUrl =
        "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=AIzaSyBO0yZ1BNCPkm_Jh0vMQ6s3UItCNkEMjZU";
      var joinedNames = "";
      for (var i = 0; i < matchingCourseNames.length; i++) {
        joinedNames += matchingCourseNames[i];
        if (i < matchingCourseNames.length - 1) {
          joinedNames += ", ";
        }
      }

      const requestData = {
        prompt: {
          text: `"Analyze and evaluate a student across their enrolled courses ${joinedNames}. Provide insights into their strengths, areas of improvement, and overall comprehension. Consider the student's performance metrics, engagement. Suggest personalized recommendations for optimizing learning strategies, addressing challenges, and enhancing future academic success. Additionally, explore potential correlations between course performance and the student's long-term academic and career goals. "`,
        },
      };

      try {
        const response = await axios.post(apiUrl, requestData);
        setResponse2(response.data.candidates[0].output);
      } catch (error) {
        console.error(error);
      }
    }

    fetchdata2();
  }, []);

  const callApi = async (e) => {
    e.preventDefault();
    setVideoPrompt([]);
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=AIzaSyBO0yZ1BNCPkm_Jh0vMQ6s3UItCNkEMjZU";

    let imgPrompt = prompttext2.split(" ").join("_");
    const imgUrl =
      "https://serpapi.com/search?tbm=isch&key=cb226c32f0288fd40bbee074aef75c6c3d8b25498b86efa613f0b48b5bc112c6&q=" +
      imgPrompt;

    const videoUrl =
      "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAftggrcsvxKDzWbGb5ZwO6B6Zo52PHlxQ&type=video&q=" +
      imgPrompt;

    console.log(imgUrl);

    // setVideoPrompt([
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    //   "https://youtu.be/SAN45D5sy2c",
    // ]);

    const requestData = {
      prompt: {
        text: `${prompttext2} `,
      },
    };

    try {
      const response = await axios.post(apiUrl, requestData);
      //   await axios.get(imgUrl).then((res) => {
      //     setImgPrompt(res.data);
      //     return res.data;
      //   });
      //   console.log(imgPrompt);
      let res = await fetch("http://localhost:4500/student/getImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api: imgUrl }),
      });
      res = await res.json();
      setImgPrompt(res.images);
      console.log(response.data);
      setResponse(response.data.candidates[0].output);
    } catch (error) {
      console.error(error);
    }

    // setVideoLoading(true);
    // try {
    //   // const vresponse = await axios.post(videoUrl, requestData);
    //   let vres = await fetch("http://localhost:4500/student/getVideos", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ api: videoUrl }),
    //   });
    //   vres = await vres.json();
    //   // setVideoPrompt(vres);
    //   for (let i = 0; i < vres.length; i++) {
    //     videoPrompt.push(`https://www.youtube.com/embed/${vres[i]}`);
    //   }
    //   console.log(videoPrompt);
    //   // setResponse(response.data.candidates[0].output);
    // } catch (error) {
    //   console.error(error);
    // } finally{
    //   setVideoLoading(false);
    // }
    setVideoLoading(true);
    try {
      // const vresponse = await axios.post(videoUrl, requestData);
      let vres = await fetch("http://localhost:4500/student/getVideos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api: videoUrl }),
      });
      vres = await vres.json();
      // console.log(vres)
      setVideoPrompt(vres.map((id) => `https://www.youtube.com/embed/${id}`));
      console.log(videoPrompt);
    } catch (error) {
      console.error(error);
    } finally {
      setVideoLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "1000px",
    // margin: "auto",
    marginTop: "20px",
    padding: "20px",
    // border: "1px solid #ccc",
    // borderRadius: "8px",
    // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const inputBoxStyle = {
    marginBottom: "0px",
  };

  const inputStyle = {
    width: "400px",
    padding: "10px",
    marginBottom: "10px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    display: "block",
    width: "100%",
    padding: "12px",
    backgroundColor: "#1890ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const responseBoxStyle = {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
  };

  const responseHeaderStyle = {
    fontSize: "18px",
    marginBottom: "10px",
  };

  const responseContentStyle = {
    fontSize: "16px",
    whiteSpace: "pre-wrap",
    marginTop: "40px",
  };

  const matchingCoursesStyle = {
    marginTop: "20px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const courseListStyle = {
    listStyleType: "none",
    padding: 0,
  };

  const courseItemStyle = {
    marginBottom: "10px",
    fontSize: "14px",
    color: "#333",
  };

  const response2Style = {
    marginTop: "20px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    whiteSpace: "pre-wrap",
  };

  return (
    <Navbar>
      <center>
        <div style={{ display: "flex", marginLeft: "18%", marginTop: "40px" }}>
          <img width={250} src="./pictures/sqa.png"></img>
          <div style={containerStyle}>
            <div style={inputBoxStyle}>
              <form onSubmit={callApi}>
                {/* <label htmlFor="prompttext2"><span style={{fontWeight:"bold" , fontSize:"larger"}}>SQA</span> - Student Query Assistance</label> */}
                <div style={{ display: "flex" }}>
                  <input
                    type="text"
                    id="prompttext2"
                    value={prompttext2}
                    onChange={(e) => setPromptText2(e.target.value)}
                    style={inputStyle}
                  />

                  <div id="containerbtn" style={{ marginLeft: "40px" }}>
                    <button type="submit" class="learn-more">
                      <span class="circle" aria-hidden="true">
                        <span class="icon arrow"></span>
                      </span>
                      <span class="button-text">Submit</span>
                    </button>
                  </div>
                </div>
                {/* <button type="submit" style={buttonStyle}>
              Submit
            </button> */}
              </form>
            </div>
          </div>
        </div>
      </center>
      {(response && videoLoading && imgPrompt ) ? (
         <center style={{ paddingTop: "100px", paddingBottom: "100px" }}>
         <RingLoader color={"#000000"} loading={true} size={70} />
         <p
           style={{
             marginTop: "15px",
             marginLeft: "20px",
             fontSize: "20px",
           }}
         >
           Loading...
         </p>
       </center>
         ) : (
      <div style={{ padding: "40px" }}>
        {response && (
          <div style={responseBoxStyle}>
            <h1 style={responseHeaderStyle}>Query Response:</h1>

            <p style={responseContentStyle}>{response}</p>
            <br />
            <br />
            <h1 style={responseHeaderStyle}>Related Photos</h1>
            <div className="">
              <div
                className=""
                style={{
                  display: "flex",
                  overflowX: "scroll",
                  scrollbarWidth: "thin",
                  scrollbarColor: "gray #f9f9f9",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  "-ms-overflow-style": "none",
                  scrollbarWidth: "none",
                }}
              >
                {imgPrompt.map(
                  (image, index) =>
                    index < 5 && (
                      <a href={image} target="_blank">
                        <img
                          id="vid"
                          key={index}
                          src={image}
                          width={380}
                          style={{ margin: "20px", borderRadius: "10px" }}
                        />
                      </a>
                    )
                )}
              </div>
            </div>
            <h1 style={responseHeaderStyle}>Related Videos</h1>
            {!videoLoading && (
              <div
                style={{
                  display: "flex",
                  overflowX: "scroll",
                  scrollbarWidth: "thin",
                  scrollbarColor: "gray #f9f9f9",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  "-ms-overflow-style": "none",
                  scrollbarWidth: "none",
                }}
              >
                {videoPrompt.map((link, index) => (
                  <div
                    key={index}
                    className="video-container "
                    style={{ margin: "20px" }}
                  >
                    <iframe
                      id="vid"
                      width="400"
                      height="220"
                      src={link}
                      // title={`YouTube Video ${index + 1}`}
                      frameBorder="0"
                      // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: "10px" }}
                    ></iframe>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
          )}
    </Navbar>
  );
};

export default Page;
