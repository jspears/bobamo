#Bobamo examples
##Usage:
I wanted to make the examples look like real projects, but there is no way in npm to make it use the parent instead of the
repo, that I can find anyways.  So when working from MASTER you need to link

```bash
cd bobamo
npm install
npm link
cd examples/<example project>
npm install
npm link bobamo

````

That way you will be using the bobamo in same project and not the probably outdated one in the npm registry.  Sorry
for the inconvience.
