import Navbar from "../../Components/Sidebar/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { RingLoader } from "react-spinners";

const Suggestions = () => {
  const [matchingCourseNames, setMatchingCourseNames] = useState([]);
  const [name, setName] = useState("");
  const [response2, setResponse2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);

  const responseContentStyle = {
    fontSize: "16px",
    whiteSpace: "pre-wrap",
    marginTop: "10px",
  };
  const response2Style = {
    marginTop: "20px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    whiteSpace: "pre-wrap",
    marginRight: "30px",
    marginBottom: "30px",
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const user = localStorage.getItem("user");
        const userCoursesResponse = await axios.get(
          `http://localhost:4500/student/${user}`
        );
        const userCourses = userCoursesResponse.data.courses;
        setName(userCoursesResponse.data.name);

        const allCoursesResponse = await axios.get(
          "http://localhost:4500/courses"
        );
        const allCourses = allCoursesResponse.data;
        const matchingNames = userCourses
          .map((userCourse) => {
            const matchingCourse = allCourses.find(
              (course) => course._id === userCourse
            );
            return matchingCourse ? matchingCourse.courseName : null;
          })
          .filter(Boolean);

        setMatchingCourseNames(matchingNames);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false); // End loading once data is fetched or error occurs.
      }
    }

    fetchData();
  }, []); // Dependency array left empty to run only once after initial render.

  useEffect(() => {
    async function fetchData2() {
      setIsLoading2(true);
      if (name && matchingCourseNames.length > 0) {
        // Ensure we have the data needed to make this call.
        const apiUrl =
          "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=AIzaSyBO0yZ1BNCPkm_Jh0vMQ6s3UItCNkEMjZU";
        const joinedNames = matchingCourseNames.join(", ");

        const requestData = {
          prompt: {
            text: `Analyze and evaluate a student across their enrolled courses. The name of the student is ${name} . The enrolled courses are: ${joinedNames}. Provide insights into their strengths, areas of improvement, and overall comprehension. Consider the student's performance metrics, engagement. Suggest personalized recommendations for optimizing learning strategies, addressing challenges, and enhancing future academic success. Additionally, explore potential correlations between course performance and the student's long-term academic and career goals.`,
          },
        };

        try {
          const response = await axios.post(apiUrl, requestData);
          setResponse2(response.data.candidates[0].output.replace("##", ""));
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading2(false);
        }
      }
    }

    fetchData2();
  }, [name, matchingCourseNames]);
  return (
    <Navbar>
      <center style={{ marginTop: "25px" }}>
        <h2 style={{}}>Personalised suggestions</h2>
      </center>
      <div>
        {isLoading ? (
          <center style={{ paddingTop: "100px", paddingBottom: "100px" }}>
            <RingLoader color={"#000000"} loading={true} size={70} />
          </center>
        ) : (
          <div style={{ marginTop: "20px", marginLeft: "30px" }}>
            <h3>Your enrolled courses:</h3>
            <div style={{ marginTop: "15px" }}>
              {matchingCourseNames.map((courseName, i) => {
                return (
                  <p key={i} style={{ marginTop: "10px", marginRight: "10px" }}>
                    {courseName}
                  </p>
                );
              })}
            </div>
          </div>
        )}
        <div
          style={{
            marginTop: "20px",
            marginLeft: "30px",
            border: "1px",
            borderColor: "black",
          }}
        >
          <h3>Personalised Roadmap : </h3>
          {isLoading2 ? (
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
            <div style={response2Style}>
              <p style={responseContentStyle}>
                {response2.replaceAll("*", "")}
              </p>
            </div>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default Suggestions;
