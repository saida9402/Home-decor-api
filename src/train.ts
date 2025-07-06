function majorityElement(arr: number[]): number | null {
  const countMap: { [key: number]: number } = {};
  let maxCount = 0;
  let mostFrequent: number | null = null;

  for (const num of arr) {
    countMap[num] = (countMap[num] || 0) + 1;

    if (countMap[num] > maxCount) {
      maxCount = countMap[num];
      mostFrequent = num;
    }
  }

  return mostFrequent;
}

let a = [1, 2, 3, 4, 5, 4, 3, 4];
let result = majorityElement(a);

console.log(result);

/* Project Standards:
  - Logging standards 
  - Naming standards:
      function, method, variable => CAMEL     
      class => PASCAL                        
      folder, file => KEBAB         
      css => SNAKE                         
  - Error handling
  
*/

/*
  Traditinal Api
  Rest Api
  GraphQL Api
  ...
*/

//npm run train start

/**
 Traditional FD => BSSR (Adminka) => EJS
 Modern FD      => SPA (Users Application)   =>  React
 */
