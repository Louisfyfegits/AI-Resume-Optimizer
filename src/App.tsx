import React, { useState } from 'react';

type ToneType = 'Standard' | 'Very Targeted' | 'Loosely targeted';

export default function App(): React.ReactElement {
  //useState hooks, [name, method to run on change (both made by useState)] 
  // they autoupdate when a change is made instead of constant checks, like javascript event listeners
  const [resumeText, setResumeText] = useState<string>(''); //original resume text
  const [jobDescription, setJobDescription] = useState<string>(''); //job description text
  const [optimizedResume, setOptimizedResume] = useState<string>(''); //optimized resume text
  const [loading, setLoading] = useState<boolean>(false); //loading state (is the API call in progress?)
  const [error, setError] = useState<string | null>(null); //error state
  const [tone, setTone] = useState<ToneType>('Standard'); //tone of the optimized resume

  const ResumeWordCount: number = countWords(resumeText); 
  const OptimizedResumeWordCount: number = countWords(optimizedResume);


  const handleOptimizeResume = async (): Promise<void> => {
    setLoading(true);
    setError(null); //clear any previous errors
    try{
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
      if (!apiKey) { throw new Error("API key is missing from your .env file.");}
      //fetch the optimized resume from the API
      const response: Response = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                 text: `Optimize the following resume for the job description provided.
                  Tone: ${tone}.
                  Resume: ${resumeText}.
                  Job Description: ${jobDescription}
                  Rewrite the resume to match keywords from the job description in personal description and career goals, 
                  remove irrelevant knowledge, and change order of skills from most relevant to least relevant left to right,
                  and pick the best three most relevant projects to highlight in the resume. Do Not Use the company name in the resume.

                  IMPORTANT: Return ONLY the final optimized resume text itself. Do not include any explanation, 
                  summary of changes, rationale, headers like "Summary of Changes", aswell as NO markdown formatting like ** or #, 
                  match the exact formatting of provided original resume. AND NO commentary before or after the resume. Output the resume text only, starting directly with 
                  the candidate's name.`
                }
              ]
            }
          ]
        })
      });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'The API returned an error.');
    }
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response was generated — the request may have been blocked.');
    }
    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('The response had no text content.');
    }
    setOptimizedResume(text); //firstResponse.textContent.string

    } catch (err) {setError("" + err)}
    setLoading(false); //set loading to false when done
  }

return (
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1.3fr_2fr] gap-6 p-6 max-w-[1600px] mx-auto">
    <h1 className="md:col-span-3 text-3xl font-bold text-stone-800 mb-2">Resume Optimizer</h1>

    {/* Original Resume - Claude color scheme */}
    <div className="flex flex-col bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
      <label className="text-sm font-semibold text-orange-900 mb-2">Original Resume</label>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your original resume here"
        className="flex-1 min-h-[28rem] w-full resize-none rounded-lg border border-orange-200 bg-white p-4
                   text-[13px] leading-relaxed text-stone-800 placeholder-stone-400
                   focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                   [font-size:clamp(6px,1.1vw,10px)]"
      />
      <label className="text-[9px] text-orange-300 mb-1 mt-1"> Words: {ResumeWordCount}</label>
    </div>

    {/* Job Description + Controls - Grey */}
    <div className="flex flex-col bg-stone-100 border border-stone-300 rounded-xl p-5 shadow-sm">
      <label className="text-sm font-semibold text-stone-700 mb-2">Job Description</label>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here"
        className="flex-1 min-h-[20rem] w-full resize-none rounded-lg border border-stone-300 bg-white p-4
                   text-[13px] leading-relaxed text-stone-800 placeholder-stone-400
                   focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
                   [font-size:clamp(6px,1.1vw,10px)]"
      />

      <label className="text-sm font-semibold text-stone-700 mt-4 mb-2">Tone</label>
      <select
        value={tone}
        onChange={(e) => setTone(e.target.value as ToneType)}
        className="w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm text-stone-800
                   focus:outline-none focus:ring-2 focus:ring-stone-400"
      >
        <option value="Standard">Standard</option>
        <option value="Very Targeted">Very Targeted</option>
        <option value="Loosely targeted">Loosely targeted</option>
      </select>

      <button
        onClick={async () => { await handleOptimizeResume(); }}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300
                   text-white font-semibold py-2.5 transition-colors"
      >
        {loading ? 'Optimizing...' : 'Optimize Resume'}
      </button>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}
    </div>

    {/* Optimized Resume*/}
    <div className="flex flex-col bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
      <label className="text-sm font-semibold text-orange-900 mb-2">Optimized Resume</label>
      <textarea
        value={optimizedResume}
        onChange={(e) => setOptimizedResume(e.target.value)}
        placeholder="Your optimized resume will appear here"
        className="flex-1 min-h-[28rem] w-full resize-none rounded-lg border border-orange-200 bg-white p-4
                   text-[13px] leading-relaxed text-stone-800 placeholder-stone-400
                   focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                   [font-size:clamp(6px,1.1vw,10px)]"
      />
      <label className="text-[9px] text-orange-300 mb-1 mt-1"> Words: {OptimizedResumeWordCount}</label>
    </div>
  </div>
);
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length; //split by whitespace and count the number of words
}

