/*  
  1. custom search function that takes `word` and `array` of words
  2. match the word with each word at array then calc a score
  3. return the word with the highest score
  4. push the word with high score to array 
  5. return the array of hich scores words
*/


export function searchWithScore(inputSearch, arrayWords) {
  // monvert all input to lower
  const normalizedInput = inputSearch.toLowerCase();
  const normalizedWords = arrayWords.map((word) => word.toLowerCase());

  const matchedWords = []; // array to store matched words

  // function to calculate the match score between input & each word at array
  function calculateScore(input, word) {
    let score = 0;          // score
    let inputIndex = 0;     // index for current letter at input
    let wordIndex = 0;      // index for array words

    // compare letters between input and word
    while (inputIndex < input.length && wordIndex < word.length) {//make sure not to exceed the length 
      if (input[inputIndex] === word[wordIndex]) { // compare letters
        score++;          // increse score
        inputIndex++;     // move to next input letter
        wordIndex++;      // move to next word letter
      } else {
        if ( // keep holding the same char then check the next letter in the word
          wordIndex + 1 < word.length &&
          input[inputIndex] === word[wordIndex + 1]
        ) {
          // If the input letter matches the next letter of the word
          score++;       // increse score
          inputIndex++; // move to the next letter in input
          wordIndex += 1; // move to the next letter in the word
        } else {
          // otherwise, just move to the next letter in the word
          wordIndex++;
        }
      }
    }

    return score; // return the final score
  }

  // loop through each word in the normalizedWords
  for (const word of normalizedWords) {
    const score = calculateScore(normalizedInput, word); // calc the match score

    // if the score is high enough, add the original word to matchedWords
    if (score > Math.floor(inputSearch.length / 2)) {
      matchedWords.push(word);  // push word to arr
    }
  }

  return matchedWords; // return the array of matched words
}

// EX:
// const inputSearch = "laptep";
// const arrayWords = ["laptol", "phone", "laptop", 'laptos' ,'t-shirt'];

// const result = searchWithScore(inputSearch, arrayWords);
// console.log(result); // output: ["laptop", "laptol", 'laptos']
