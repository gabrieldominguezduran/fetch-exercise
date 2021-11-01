const axios = require("axios");

async function getComponents() {
  try {
    const response = await axios.get(`${BASEURL}project/IC/components`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function getIssues(id) {
  try {
    const response = await axios.get(`${BASEURL}search?jql=project=${id}`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getIssuesByComponent() {
  let issues = [];
  let ids = [];
  const components = await getComponents();
  for await (const comp of components) {
    if (!comp.isAssigneeTypeValid) {
      ids.push(comp.projectId);
    }
  }
  let uniqIds = [...new Set(ids)];
  return (async () => {
    Promise.all(
      uniqIds.map(async (id) => {
        const response = await getIssues(id);
        for await (const issue of response.issues) {
          issues.push({
            id: issue.id,
            fields: issue.fields,
          });
        }
        issues.map((issue) => {
          if (issue.fields.status.statusCategory.name !== "Done") {
            console.log(`
          The issue with id: "${issue.id}" from project: "${
              issue.fields.project.name
            }" where: "${issue.fields.issuetype.description}", is on status: "${
              issue.fields.status.description
                ? issue.fields.status.description
                : "WIP"
            }"
          `);
          }
        });
      })
    );
  })();
}

getIssuesByComponent();
