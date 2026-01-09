/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActivityTracker } from "./activity-tracker";
import { MAX_ITERATIONS } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";


export async function deepResearch(researchState: ResearchState, dataStream: any){
    let iteration = 0;
    
    const activityTracker = createActivityTracker(dataStream, researchState);

    const initialQueries = await generateSearchQueries(researchState, activityTracker);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentQueries = (initialQueries as any).searchQueries
    while(currentQueries && currentQueries.length > 0 && iteration <=  MAX_ITERATIONS){
        iteration++;

        console.log("We are running on the itration number: ", iteration);

        const searchResults = currentQueries.map((query: string) => search(query, researchState, activityTracker));
        const searchResultsResponses = await Promise.allSettled(searchResults)

        const allSearchResults = searchResultsResponses.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()

        console.log(`We got ${allSearchResults.length} search results!`)

const newFindings = await processSearchResults(
    allSearchResults, researchState, activityTracker
)

console.log("Results are processed!")

researchState.findings = [...researchState.findings, ...newFindings]

const analysis = await analyzeFindings(
    researchState,
    currentQueries,
    iteration, 
    activityTracker
)

console.log("Analysis: ", analysis)

if((analysis as any).sufficient){
    break;
}


        currentQueries = ((analysis as any).queries || []).filter((query:string) => !currentQueries.includes(query));
    }

    console.log("We are outside of the loop with total iterations: ", iteration)

    const report = await generateReport(researchState, activityTracker);

    dataStream.writeData({
        type: "report",
        content: report
    })

    // console.log("REPORT: ", report)

    return initialQueries;

}