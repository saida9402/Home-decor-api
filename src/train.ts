//TASK Q

function hasProperty(obj: Record<string, string>, key: string): boolean {
  return key in obj;
}

console.log(hasProperty({ name: "BMW", model: "M3" }, "country"));
console.log(hasProperty({ name: "BMW", year: "2025" }, "year"));
console.log(hasProperty({ name: "BMW" }, "model"));

// //TASK P
// function objectToArray(obj: Record<string, any>): [string, any][] {
//   return Object.entries(obj);
// }

// console.log(objectToArray({ a: 10, b: 20 }));

// /TASK O
// function calculateSumOfNumbers(arr: any[]): number {
//   let sum = 0;

//   for (const item of arr) {
//     if (typeof item === "number") {
//       sum += item;
//     }
//   }

//   return sum;
// }

// const b = [10, "10", { son: 10 }, true, 35];

// /TASK N

// function palindromCheck(word: string): boolean {
//   const reversed = word.split("").reverse().join("");
//   return word === reversed;
// }

// const a = getSquareNumbers([1, 2, 3]);
// console.log(a);
// console.log(palindromCheck("dad"));
// console.log(palindromCheck("son"));
// console.log(palindromCheck("44"));
// console.log(palindromCheck("474"));
// console.log(palindromCheck("47894"));
// console.log(palindromCheck("saida"));

//TASK M
// type NumberWithSquare = {
//   number: number;
//   square: number;
// };

// function getSquareNumbers(arr: number[]): NumberWithSquare[] {
//   return arr.map((num) => ({
//     number: num,
//     square: num * num,
//   }));
// }

// const a = getSquareNumbers([1, 2, 3]);
// console.log(a);

//TASK L
// const reverseSentence = (text: string): string =>
//   text
//     .split(" ")
//     .map((word) => [...word].reverse().join(""))
//     .join(" ");

// console.log(reverseSentence("we like coding!"));
// console.log(reverseSentence("I'm from Uzbekistan"));

// // TASK K

// function countVowels(str: string): number {
//   const vowels: string[] = ["a", "e", "i", "o", "u"];
//   let count: number = 0;

//   for (const char of str.toLowerCase()) {
//     if (vowels.includes(char)) {
//       count++;
//     }
//   }

//   return count;
// }

// console.log(countVowels("string"));
// console.log(countVowels("saida"));

// TASK J
// function findLongestWord(text: string): string {
//   const words = text.split(" ");
//   let longest = "";

//   for (const word of words) {
//     if (word.length > longest.length) {
//       longest = word;
//     }
//   }

//   return longest;
// }

// let b = "hdhsbsnsjd hsbsnaks hh hhsks jshsvdg";
// let javob = findLongestWord(b);

// console.log(javob);

// task i

// function majorityElement(arr: number[]): number | null {
//   const countMap: { [key: number]: number } = {};
//   let maxCount = 0;
//   let mostFrequent: number | null = null;

//   for (const num of arr) {
//     countMap[num] = (countMap[num] || 0) + 1;

//     if (countMap[num] > maxCount) {
//       maxCount = countMap[num];
//       mostFrequent = num;
//     }
//   }

//   return mostFrequent;
// }

// let a = [1, 2, 3, 4, 5, 4, 3, 4];
// let result = majorityElement(a);

// console.log(result);

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

/**
  * cookies
  

  */
