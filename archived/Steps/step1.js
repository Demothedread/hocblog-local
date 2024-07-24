import {WebflowClient} from "webflow-api";

const authorizeUrl = WebflowClient.authorizeURL({
    state: "your_state",
    scope: "cms:read cms:write assets:read assets:write pages:read pages:write sites:read sites:write forms:read forms:write",
    clientId: "4a2eb1e37fb930cf2f249f6965c5d0d11a7cd1c992f29d0fd259303475f734ac",
    redirectUri: "https://0e8c-172-248-182-238.ngrok-free.app/callback",
});

console.log(authorizeUrl);