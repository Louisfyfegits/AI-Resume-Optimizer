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
                  text: `You are editing a resume for a specific job application. Follow these rules with zero exceptions.

                Original resume: <Original Resume>${resumeText} </Original Resume>
                Job description: <Job Description>${jobDescription} </Job Description>
                Tone: <Tone>${tone} </Tone>

                You are allowed to change ONLY these following four things. Every other section must be copied
                character-for-character, unchanged — same wording, same punctuation, same line breaks,
                same section headers, same order of sections. 
              

                1. PROJECTS: From the projects listed under "Relevant Project Experience," keep only the
                  3 most relevant to the job description. Remove the rest entirely. Order the 3 kept
                  projects from most to least relevant. Do not reword the project titles or descriptions —
                  only decide which 3 to keep and what order to list them in.

                2. SKILLS: Within each existing skills category (e.g. "Programming Languages,"
                  "Frameworks & Libraries"), reorder the items from most to least relevant to the job
                  description. Do not add, remove, rename, or reword any category or any individual skill —
                  only reorder items within their existing category.

                3. CAREER OBJECTIVE (or equivalent personal-statement section): Rewrite this section so it
                  naturally incorporates 2-4 keywords or phrases from the job description. Keep it roughly
                  the same length as the original.

                4. CORE ATTRIBUTES (or equivalent section describing soft skills / personal qualities):
                  Rewrite this section to align with what the job description is looking for. You may
                  rephrase the reasoning and examples given to better connect them to the job description's
                  priorities, as long as you stay grounded in the general kind of experience already
                  described in the original (e.g. if the original mentions teamwork through group projects,
                  you can rephrase or reframe that, but don't invent an entirely unrelated type of
                  experience). Keep the same number of attributes/bullets as the original.

                DO NOT, under any circumstances:
                - Change any wording in Education, Professional Experience, or Additional Experience
                  sections — copy these sections exactly as given, word for word.
                - Add any company, date, or skill not present in the original resume.
                - Use slang, filler phrases, or conversational asides (e.g. never write "or something,"
                  "kind of," "or smt").
                - Write sentence fragments — every sentence must be complete and grammatically correct.
                - Add markdown formatting (no **, no #).
                - Add commentary, explanations, or a summary of what you changed.

                OUTPUT FORMAT:
                Return only the final resume text, starting directly with the candidate's name. Nothing else.`
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
           text-white font-semibold py-2.5 transition-colors
           flex items-center justify-center gap-2"
      > {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> }
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

