import { useRef, useState } from "react";
import axios from "axios";

const CAT_FACT_URL = "https://catfact.ninja/fact";
const DOG_FACT_URL = "https://dogapi.dog/api/v2/facts";

/*
type CatFact = {
  fact: string;
  length: number;
};

type DogFact = {
  data: [
    {
      id: string;
      type: string;
      attributes: {
        body: string;
      };
    },
  ];
};
*/

type PetFact = {
  title: string;
  text: string;
};

function App() {
  const [petFact, setPetFact] = useState<PetFact | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  async function fetch_fact(url: string) {
    if (abortRef.current) abortRef.current.abort();

    setIsFetching(true);
    setError(null);
    setPetFact(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await axios(url, { signal: controller.signal });
      const fact = response.data;

      if ("fact" in fact) {
        setPetFact({ title: "Cat fact", text: fact.fact });
      } else if (
        "data" in fact &&
        Array.isArray(fact.data) &&
        "attributes" in fact.data[0] &&
        "body" in fact.data[0].attributes
      ) {
        setPetFact({ title: "Dog fact", text: fact.data[0].attributes.body });
      } else {
        setError("Wrong API format");
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } else {
        console.log("Request aborted.");
      }
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className="inset-0 h-[100dvh] bg-amber-700 text-amber-300">
      <header className="pt-6 text-center text-3xl font-bold">
        🐱 Pet Facts 🐶
      </header>
      <main className="mt-12">
        <div className="flex justify-evenly text-xl">
          <button
            onClick={() => fetch_fact(CAT_FACT_URL)}
            className="rounded-full bg-amber-900 p-4"
          >
            Random cat fact
          </button>
          <button
            onClick={() => fetch_fact(DOG_FACT_URL)}
            className="rounded-full bg-amber-900 p-4"
          >
            Random dog fact
          </button>
        </div>
        {isFetching && <p>Getting a fact...</p>}
        {error && <p>{error}</p>}
        {petFact && (
          <div className="mt-12 flex flex-col items-center">
            <h2 className="text-2xl font-bold">{petFact.title}</h2>
            <p className="mt-6 max-w-[70dvw] text-lg">{petFact.text}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
