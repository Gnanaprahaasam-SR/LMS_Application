import { SPFI, spfi, SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import "@pnp/sp/attachments";
import "@pnp/sp/folders/web";
import "@pnp/sp/files";
import "@pnp/sp/presets/all";


let _sp: SPFI | null = null;

export const getSP = (context: WebPartContext, logLevel: LogLevel = LogLevel.Warning): SPFI => {
    if (_sp === null && context !== null) {
        _sp = spfi().using(SPFx(context)).using(PnPLogging(logLevel));
    } else if (_sp === null) {
        throw new Error("SPFI is not initialized. Make sure to call getSP function with a valid context first.");
    }
    return _sp;
};


export class LMSApplicationService {
    private context: WebPartContext;

    constructor(context: WebPartContext) {
        this.context = context;
    }

    public async getLMSCategories(): Promise<any[]> {
        const sp = getSP(this.context);
        const web = sp?.web; // Access the web object directly from sp
        const list = web?.lists?.getByTitle("LMSCategories");
        // console.log("List", list);
        try {
            console.log("Fetching items from LMSCategories list...");
            const items = await list.items.select("ID", "Name").top(2000)();
            console.log("Fetched items:", items);
            return items;
        } catch (error) {
            console.error("Error retrieving LMSCategories:", error);
            throw error;
        }
    }


    public async getLMSPolicies(): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web?.lists?.getByTitle("LMSPolicies");

        try {

            const documents = await documentsLibrary?.items?.select(
                "FileLeafRef",
                "FileRef",
                "Id",
                "Modified",
                "PolicyName",
                "PolicyDescription", // Custom field: Policy Description
                "Created",
                "Thumbnail/ID",
                "Category/ID",
                "Category/Name",
                "PolicyId"
                // "ThumbnailId/FileRef",  // Thumbnail file reference
                // "Thumbnail/Category"  // Thumbnail category
            )
                .expand("Thumbnail", "Category")
                .orderBy("Modified", false)
                .top(2000)();


            if (documents?.length > 0) {
                return documents;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error retrieving documents from LMSPolicies list:", error);
            throw error;
        }
    }

    public async getLMSOreintations(): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web?.lists?.getByTitle("LMSOrientations");

        try {

            const documents = await documentsLibrary?.items?.select(
                "FileLeafRef",
                "FileRef",     // File URL
                "Id",          // Document ID
                "Modified",    // Modified date 
                "OrientationName",  // Custom field: Policy Name
                "OrientationDescription",
                "Created",
                "Thumbnail/ID",
                "Category/ID",
                "Category/Name",
                "OrientationId",
                // "ThumbnailId/FileRef",  // Thumbnail file reference
                // "Thumbnail/Category"  // Thumbnail category
            )
                .expand("Thumbnail", "Category")
                .orderBy("Modified", false)
                .top(2000)();


            if (documents?.length > 0) {
                return documents;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error retrieving documents from LMSOrientations list:", error);
            throw error;
        }
    }

    public async getLMSTrainings(): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web?.lists?.getByTitle("LMSTrainings");

        try {

            const documents = await documentsLibrary?.items?.select(
                "FileLeafRef", // File name
                "FileRef",     // File URL
                "Id",          // Document ID
                "Modified",    // Modified date 
                "TrainingName",  // Custom field: Policy Name
                "TrainingDescription", // Custom field: Policy Description
                "Created",     // Created date
                "Thumbnail/ID",
                "Category/ID",
                "Category/Name",
                "Duration",
                "TrainingId"

                // "ThumbnailId/FileRef",  // Thumbnail file reference
                // "Thumbnail/Category"  // Thumbnail category
            )
                .expand("Thumbnail", "Category")
                .orderBy("Modified", false)
                .top(2000)();


            if (documents?.length > 0) {
                return documents;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error retrieving documents from LMSTrainings list:", error);
            throw error;
        }
    }

    public async getPolicyById(policyId: string): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web.lists.getByTitle("LMSPolicies");

        try {
            const document = await documentsLibrary.items.filter(`PolicyId eq '${policyId}'`)
                .select(
                    "FileLeafRef",       // File name
                    "FileRef",           // File URL
                    "Id",                // Document ID
                    "Modified",          // Modified date 
                    "PolicyName",        // Custom field: Policy Name
                    "PolicyDescription", // Custom field: Policy Description
                    "Created",           // Created date
                    "Thumbnail/ID",      // Thumbnail ID
                    "Category/ID",       // Category ID
                    "Category/Name",
                    "PolicyId"      // Category Name
                )
                .expand("Thumbnail", "Category")();

            console.log(document)
            return document || null;
        } catch (error) {
            console.error("Error retrieving the document from LMSPolicies list:", error);
            throw error;
        }
    }

    public async getOrientationById(orientationId: string): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web.lists.getByTitle("LMSOrientations");

        try {
            const document = await documentsLibrary.items.filter(`OrientationId eq '${orientationId}'`)
                .select(
                    "FileLeafRef",       // File name
                    "FileRef",           // File URL
                    "Id",                // Document ID
                    "Modified",          // Modified date 
                    "OrientationName",        // Custom field: Policy Name
                    "OrientationDescription", // Custom field: Policy Description
                    "Created",           // Created date
                    "Thumbnail/ID",      // Thumbnail ID
                    "Category/ID",       // Category ID
                    "Category/Name",     // Category Name
                    "OrientationId"
                )
                .expand("Thumbnail", "Category")();

            return document || null;
        } catch (error) {
            console.error("Error retrieving the document from LMSOrientations list:", error);
            throw error;
        }
    }

    public async getTrainingById(trainingId: string): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }
        const documentsLibrary = web.lists.getByTitle("LMSTrainings");

        try {
            const document = await documentsLibrary.items.filter(`TrainingId eq '${trainingId}'`)
                .select(
                    "FileLeafRef",       // File name
                    "FileRef",           // File URL
                    "Id",                // Document ID
                    "Modified",          // Modified date 
                    "TrainingName",
                    "TrainingDescription",
                    "Created",           // Created date
                    "Thumbnail/ID",      // Thumbnail ID
                    "Category/ID",       // Category ID
                    "Category/Name",
                    "TrainingId",
                    "Duration"      // Category Name
                )
                .expand("Thumbnail", "Category")();

            return document || null;
        } catch (error) {
            console.error("Error retrieving the document from LMSTrainings list:", error);
            throw error;
        }
    }

    public async getAssessment(LearningType: string, LearningId: string): Promise<any> {
        const sp = getSP(this.context);

        try {
            // Access the SharePoint list
            const list = sp?.web?.lists?.getByTitle("LMSQuestionAndAnswer");

            // Query the items with filter and select specific fields
            const documents = await list.items
                .filter(`LearningType eq '${LearningType}' and LearningId eq '${LearningId}'`)
                .select(
                    "ID",
                    "Question",
                    "QuestionType",
                    "Option1",
                    "Option2",
                    "Option3",
                    "Option4",
                    "Answer",
                    "LearningType",
                    "LearningId",
                    "PhaseDuration"
                )
                .top(2000)();

            console.log("Retrieved Documents:", documents);

            // Return the documents or an empty array
            return documents.length > 0 ? documents : [];
        } catch (error) {
            console.error("Error retrieving documents from LMSQuestionAndAnswer list:", error);
            throw error;
        }
    }

    public async insertLearningScore(resultData: any): Promise<any> {
        const sp = getSP(this.context);
        console.log(resultData);
        try {
            // Access the SharePoint list
            const list = sp?.web?.lists?.getByTitle("LMSLearningScore");

            const existingItem = await list.items
                .select('Id', 'LearningId', 'LearningType', 'TestCandidateId', 'TestScore', 'Status', 'TestValue') 
                .filter(`LearningId eq '${resultData.LearningId}' and LearningType eq '${resultData.LearningType}' and TestCandidateId eq ${resultData.TestCandidateId}`)()

            console.log(existingItem);

            if (existingItem.length > 0) {
                const itemId = existingItem[0].Id; // Get the ID of the existing item
                const updatedValue = {
                    LearningId: resultData.LearningId,
                    LearningType: resultData.LearningType,
                    TestCandidateId: resultData.TestCandidateId,
                    TestScore: resultData.TestScore,
                    Status: resultData.Status,
                    TestValue: resultData.TestValue,
                };

                // Update the item
                const updatedItem = await list.items.getById(itemId).update(updatedValue);
                console.log("Updated item successfully:", updatedItem);
                return true;
            } else {
                // If item doesn't exist, add a new one
                const newItem = {
                    LearningId: resultData.LearningId,
                    LearningType: resultData.LearningType,
                    TestCandidateId: resultData.TestCandidateId,
                    TestScore: resultData.TestScore,
                    Status: resultData.Status,
                    TestValue: resultData.TestValue,
                };

                const createdItem = await list.items.add(newItem);
                console.log("Inserted item successfully:", createdItem);
                return true;
            }
        } catch (error) {
            console.error("Error On inserting LMSLearningScore:", error);
            throw error;
        }
    }

    public async getLearningScore(Id: string, Type: string, userId: number): Promise<any> {
        const sp = getSP(this.context);
        try {
            // Access the SharePoint list
            const list = sp?.web?.lists?.getByTitle("LMSLearningScore");

            const existingItem = await list.items.filter(`LearningType eq '${Type}' and LearningId eq '${Id}' and TestCandidateId eq '${userId}'`).select(
                "ID",
                "LearningId",
                "LearningType",
                "TestCandidateId",
                "TestScore",
                "Status",
                "TestValue"
            )();
            console.log("Retrieved Documents:", existingItem);
            return existingItem;
        } catch (error) {
            console.error("Error On inserting LMSLearningScore:", error);
            throw error;
        }
    }
}

