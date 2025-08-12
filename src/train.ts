//TASK X

function countOccurrences(obj: Record<string, any>, key: string): number {
  let count = 0;

  function search(current: any) {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      for (const k in current) {
        if (k === key) {
          count++;
        }

        if (typeof current[k] === "object" && current[k] !== null) {
          search(current[k]);
        }
      }
    }
  }

  search(obj);
  return count;
}

const data = {
  model: "Bugatti",
  steer: {
    model: "HANKOOK",
    size: 30,
  },
};

console.log(countOccurrences(data, "model"));

//TASK W
// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const result: T[][] = [];

//   for (let i = 0; i < arr.length; i += size) {
//     const chunk = arr.slice(i, i + size);
//     result.push(chunk);
//   }

//   return result;
// }

// const result = chunkArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
// console.log(result);
//TASK V
// function countChars(input: string): Record<string, number> {
//   const result: Record<string, number> = {};

//   for (const char of input) {
//     if (result[char]) {
//       result[char] += 1;
//     } else {
//       result[char] = 1;
//     }
//   }

//   return result;
// }

// console.log(countChars("hello"));

//TASK U
// shunday function tuzing, uni number parametri bo'lsin.
// Va bu function berilgan parametrgacha, 0'dan boshlab
// oraliqda nechta toq sonlar borligini aniqlab return qilsi.

// MASALAN: sumOdds(9) return 4; sumOdds(11) return 5;

// Yuqoridagi birinchi misolda, argument sifatida, 9 berilmoqda.
// Va 0'dan boshlab sanaganda 9'gacha 4'ta toq son mavjud.
// Keyingi namunada ham xuddi shunday xolat takrorlanmoqda.

// function sumOdds(number: number): number {
//   let count = 0;
//   for (let i = 1; i < number; i += 2) {
//     count++;
//   }
//   return count;
// }

// console.log(sumOdds(9));
// console.log(sumOdds(99));
// console.log(sumOdds(1));

//Task T
// function mergeSortedArrays(arr1: number[], arr2: number[]): number[] {
//   const mergedArray = [...arr1, ...arr2];
//   return mergedArray.sort((a, b) => a - b);
// }

// console.log(mergeSortedArrays([0, 8, 6, 94], [2, 9, 88]));

// function missingNumber(nums: number[]): number {
//   const n: number = nums.length;
//   const expectedSum: number = (n * (n + 1)) / 2;
//   const actualSum: number = nums.reduce((sum, num) => sum + num, 0);
//   return expectedSum - actualSum;
// }

// console.log(missingNumber([3, 0, 1]));
// console.log(missingNumber([0, 6, 9]));

//TASK Q

// function hasProperty(obj: Record<string, string>, key: string): boolean {
//   return key in obj;
// }

// console.log(hasProperty({ name: "BMW", model: "M3" }, "country"));
// console.log(hasProperty({ name: "BMW", year: "2025" }, "year"));
// console.log(hasProperty({ name: "BMW" }, "model"));

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
