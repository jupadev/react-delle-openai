import { ChangeEvent, ChangeEventHandler, useState } from "react";
import "./App.css";

const surpriseOptions = [
  "Sharks drinking a cocktail in the beach",
  "A flag on moon surface with sunlight",
  "A cat wearing samurai suit japanese art",
  "A velociraptor with astronaut helmet with space in the background",
];
const App = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<null | string[]>(null);
  const [fetching, setFetching] = useState(false);
  const [filePath, setFilePath] = useState("");

  const getImageHandler = async () => {
    try {
      const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({
          message: prompt,
        }),
        headers: {
          "content-type": "application/json",
        },
      };
      setFetching(true);
      const response = await fetch("http://localhost:5173/api/images", options);
      const data: Record<"url", string>[] = await response.json();
      setGeneratedImages(data.map((image) => image.url));
      setFetching(false);
    } catch (error) {
      console.log("error getting image from API", error);
      setFetching(false);
    }
  };

  const surpriseMeHandler = () => {
    const index = Math.floor(Math.random() * surpriseOptions.length);
    setPrompt(surpriseOptions[index]);
  };

  const fileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const options: RequestInit = {
        method: "POST",
        body: formData,
      };

      const response = await fetch(
        "http://localhost:5173/api/images/upload",
        options
      );
      const data = await response.json();
      setFilePath(data.fieldPath);
    } catch (error) {
      console.log(error);
      setFilePath("");
    }
  };
  const generateFromImageHandler = async () => {
    try {
      const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({
          filePath,
        }),
        headers: {
          "content-type": "application/json",
        },
      };
      setFetching(true);
      const response = await fetch(
        "http://localhost:5173/api/images/variations",
        options
      );
      const data: Record<"url", string>[] = await response.json();
      setFetching(false);
      setFilePath("");
      setGeneratedImages(data.map((image) => image.url));
    } catch (error) {
      console.log(error);
      setFetching(false);
    }
  };
  return (
    <main>
      <section className="search-container">
        <p>
          Start with a detailed description{" "}
          <a href="#" onClick={surpriseMeHandler} className="surprise">
            Surprise me
          </a>
        </p>
        <div className="input-container">
          <input
            type="text"
            maxLength={150}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.currentTarget.value);
            }}
            className="input"
            placeholder="Type something to generate"
          />
          <button
            className="button"
            onClick={getImageHandler}
            disabled={fetching}
          >
            Generate
          </button>
        </div>
        <div className="drag-image-container">
          <p>or, add an image (drag and drop allowed)</p>
          <label htmlFor="file-upload" className="label">
            upload an image to edit
          </label>
          <input
            id="file-upload"
            onChange={fileUploadHandler}
            type="file"
            accept="image/*"
            hidden
          />
        </div>
        {fetching && <span>Generating image...</span>}
        {filePath && (
          <button className="button" onClick={generateFromImageHandler}>
            Generate from image
          </button>
        )}
        {generatedImages?.length && !fetching && (
          <div className="search-result">
            {generatedImages.map((imageUrl) => (
              <img
                style={{
                  width: "512px",
                  height: "512px",
                }}
                src={imageUrl}
                alt="search result image"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default App;
