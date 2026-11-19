// ═══════════════════════════════════════════════════
//         APTITUDE QUESTION BANK
// ═══════════════════════════════════════════════════
const APT_BANK = [
  { q:"If 6 workers complete a job in 12 days, how many days will 9 workers take?", opts:["6","8","9","10"], ans:"8", category:"Quantitative" },
  { q:"A train 150m long passes a pole in 15 seconds. What is its speed (km/h)?", opts:["36","40","54","60"], ans:"36", category:"Quantitative" },
  { q:"What is 15% of 400?", opts:["45","50","55","60"], ans:"60", category:"Quantitative" },
  { q:"Find the next number: 2, 6, 12, 20, 30, ?", opts:["40","42","44","46"], ans:"42", category:"Logical" },
  { q:"A shopkeeper sells an item for ₹540 at 10% profit. What is the cost price?", opts:["₹480","₹490","₹500","₹510"], ans:"₹490", category:"Quantitative" },
  { q:"If A=2, B=4, C=6... what is the value of Z?", opts:["48","50","52","54"], ans:"52", category:"Logical" },
  { q:"Two pipes fill a tank in 20 and 30 minutes. Together, how long?", opts:["10 min","12 min","15 min","18 min"], ans:"12 min", category:"Quantitative" },
  { q:"What is the simple interest on ₹5000 at 8% per annum for 3 years?", opts:["₹1000","₹1200","₹1500","₹1800"], ans:"₹1200", category:"Quantitative" },
  { q:"Find the odd one out: Circle, Square, Cone, Triangle", opts:["Circle","Square","Cone","Triangle"], ans:"Cone", category:"Logical" },
  { q:"A is twice as old as B. 5 years ago A was 3 times older. Find A's age.", opts:["20","25","30","35"], ans:"20", category:"Quantitative" },
  { q:"If MANGO is coded as NBOHP, how is APPLE coded?", opts:["BQQMF","BPQMF","CQQMF","BQQNF"], ans:"BQQMF", category:"Logical" },
  { q:"A rectangle has length 12 and width 8. What is the area?", opts:["80","96","100","104"], ans:"96", category:"Quantitative" },
];

// ═══════════════════════════════════════════════════
//   CODING QUESTION BANK — Multi Language Support
// ═══════════════════════════════════════════════════

// Supported languages with starter templates
const LANGUAGES = [
  { id:"python",  label:"Python",     icon:"🐍", comment:"#" },
  { id:"java",    label:"Java",       icon:"☕", comment:"//" },
  { id:"c",       label:"C",          icon:"⚙️", comment:"//" },
  { id:"cpp",     label:"C++",        icon:"🔧", comment:"//" },
  { id:"javascript", label:"JavaScript", icon:"🟨", comment:"//" },
];

// Starter code templates per language
const STARTERS = {
  python:     "# Write your solution here\n\ndef solution():\n    pass\n",
  java:       "// Write your solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n",
  c:          "// Write your solution here\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n",
  cpp:        "// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n",
  javascript: "// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n",
};

// ── Coding Questions with multi-language keywords ──
const CODE_BANK = [
  {
    title: "Reverse a String",
    difficulty: "Easy",
    desc: "Write a function that reverses a given string.\n\nExample:\n  Input:  'hello'\n  Output: 'olleh'",
    hint: "Python: use slicing s[::-1]  |  Java: use StringBuilder.reverse()  |  C/C++: swap from both ends  |  JS: split().reverse().join()",
    keywords: {
      python:     ["def","return","[::-1]"],
      java:       ["reverse","StringBuilder","return"],
      c:          ["strlen","for","char"],
      cpp:        ["reverse","string","return"],
      javascript: ["function","return","reverse","split","join"],
    },
    solutions: {
      python:     "def reverse_string(s):\n    return s[::-1]\n\nprint(reverse_string('hello'))  # olleh",
      java:       "public class Solution {\n    public static String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n    public static void main(String[] args) {\n        System.out.println(reverseString(\"hello\"));\n    }\n}",
      c:          "#include <stdio.h>\n#include <string.h>\nvoid reverse(char *s) {\n    int n = strlen(s);\n    for(int i=0;i<n/2;i++){char t=s[i];s[i]=s[n-1-i];s[n-1-i]=t;}\n}\nint main() { char s[]=\"hello\"; reverse(s); printf(\"%s\\n\",s); return 0; }",
      cpp:        "#include<iostream>\n#include<algorithm>\nusing namespace std;\nint main(){\n    string s=\"hello\";\n    reverse(s.begin(),s.end());\n    cout<<s<<endl;\n    return 0;\n}",
      javascript: "function reverseString(s) {\n    return s.split('').reverse().join('');\n}\nconsole.log(reverseString('hello')); // olleh",
    }
  },
  {
    title: "Check Prime Number",
    difficulty: "Medium",
    desc: "Write a function to check if a number is prime.\n\nExample:\n  Input: 7  → true\n  Input: 4  → false",
    hint: "Loop from 2 to sqrt(n) and check if any number divides n evenly.",
    keywords: {
      python:     ["def","for","range","return","True","False"],
      java:       ["boolean","for","return","true","false","sqrt"],
      c:          ["int","for","return","sqrt"],
      cpp:        ["bool","for","return","sqrt"],
      javascript: ["function","for","return","true","false","Math.sqrt"],
    },
    solutions: {
      python:     "def is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0: return False\n    return True",
      java:       "public static boolean isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i <= Math.sqrt(n); i++)\n        if (n % i == 0) return false;\n    return true;\n}",
      c:          "#include<math.h>\nint isPrime(int n){\n    if(n<2) return 0;\n    for(int i=2;i<=sqrt(n);i++) if(n%i==0) return 0;\n    return 1;\n}",
      cpp:        "#include<cmath>\nbool isPrime(int n){\n    if(n<2) return false;\n    for(int i=2;i<=sqrt(n);i++) if(n%i==0) return false;\n    return true;\n}",
      javascript: "function isPrime(n) {\n    if (n < 2) return false;\n    for (let i = 2; i <= Math.sqrt(n); i++)\n        if (n % i === 0) return false;\n    return true;\n}",
    }
  },
  {
    title: "Fibonacci Series",
    difficulty: "Easy",
    desc: "Return the first N numbers of the Fibonacci series.\n\nExample:\n  Input:  5\n  Output: [0, 1, 1, 2, 3]",
    hint: "Start with 0 and 1, then each next number = sum of previous two.",
    keywords: {
      python:     ["def","for","append","return","range"],
      java:       ["for","int[]","return","array"],
      c:          ["for","int","printf","array"],
      cpp:        ["for","vector","push_back","return"],
      javascript: ["function","for","push","return","array"],
    },
    solutions: {
      python:     "def fibonacci(n):\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib[:n]",
      java:       "public static int[] fibonacci(int n) {\n    int[] fib = new int[n];\n    fib[0]=0; if(n>1) fib[1]=1;\n    for(int i=2;i<n;i++) fib[i]=fib[i-1]+fib[i-2];\n    return fib;\n}",
      c:          "void fibonacci(int n){\n    int a=0,b=1,c;\n    for(int i=0;i<n;i++){printf(\"%d \",a);c=a+b;a=b;b=c;}\n}",
      cpp:        "#include<vector>\nvector<int> fibonacci(int n){\n    vector<int> fib={0,1};\n    for(int i=2;i<n;i++) fib.push_back(fib.back()+fib[fib.size()-2]);\n    return fib;\n}",
      javascript: "function fibonacci(n) {\n    let fib = [0, 1];\n    for (let i = 2; i < n; i++) fib.push(fib[i-1] + fib[i-2]);\n    return fib.slice(0, n);\n}",
    }
  },
  {
    title: "Find Largest Element",
    difficulty: "Easy",
    desc: "Find the largest element in an array WITHOUT using built-in max functions.\n\nExample:\n  Input:  [3, 1, 7, 2, 5]\n  Output: 7",
    hint: "Use a loop, track the largest value seen so far.",
    keywords: {
      python:     ["def","for","if","return"],
      java:       ["for","if","int","return"],
      c:          ["for","if","int","return"],
      cpp:        ["for","if","int","return"],
      javascript: ["function","for","if","return"],
    },
    solutions: {
      python:     "def find_largest(lst):\n    largest = lst[0]\n    for num in lst:\n        if num > largest:\n            largest = num\n    return largest",
      java:       "public static int findLargest(int[] arr) {\n    int largest = arr[0];\n    for (int num : arr)\n        if (num > largest) largest = num;\n    return largest;\n}",
      c:          "int findLargest(int arr[], int n){\n    int largest=arr[0];\n    for(int i=1;i<n;i++) if(arr[i]>largest) largest=arr[i];\n    return largest;\n}",
      cpp:        "int findLargest(vector<int> arr){\n    int largest=arr[0];\n    for(int x:arr) if(x>largest) largest=x;\n    return largest;\n}",
      javascript: "function findLargest(arr) {\n    let largest = arr[0];\n    for (let num of arr)\n        if (num > largest) largest = num;\n    return largest;\n}",
    }
  },
  {
    title: "FizzBuzz",
    difficulty: "Easy",
    desc: "Print 1 to 20. For multiples of 3 print 'Fizz', multiples of 5 print 'Buzz', both print 'FizzBuzz'.",
    hint: "Use the modulo (%) operator to check divisibility.",
    keywords: {
      python:     ["for","range","if","elif","print","Fizz","Buzz","%"],
      java:       ["for","if","System.out","Fizz","Buzz","%"],
      c:          ["for","if","printf","Fizz","Buzz","%"],
      cpp:        ["for","if","cout","Fizz","Buzz","%"],
      javascript: ["for","if","console","Fizz","Buzz","%"],
    },
    solutions: {
      python:     "for i in range(1, 21):\n    if i % 15 == 0: print('FizzBuzz')\n    elif i % 3 == 0: print('Fizz')\n    elif i % 5 == 0: print('Buzz')\n    else: print(i)",
      java:       "for(int i=1;i<=20;i++){\n    if(i%15==0) System.out.println(\"FizzBuzz\");\n    else if(i%3==0) System.out.println(\"Fizz\");\n    else if(i%5==0) System.out.println(\"Buzz\");\n    else System.out.println(i);\n}",
      c:          "for(int i=1;i<=20;i++){\n    if(i%15==0) printf(\"FizzBuzz\\n\");\n    else if(i%3==0) printf(\"Fizz\\n\");\n    else if(i%5==0) printf(\"Buzz\\n\");\n    else printf(\"%d\\n\",i);\n}",
      cpp:        "for(int i=1;i<=20;i++){\n    if(i%15==0) cout<<\"FizzBuzz\"<<endl;\n    else if(i%3==0) cout<<\"Fizz\"<<endl;\n    else if(i%5==0) cout<<\"Buzz\"<<endl;\n    else cout<<i<<endl;\n}",
      javascript: "for(let i=1;i<=20;i++){\n    if(i%15===0) console.log('FizzBuzz');\n    else if(i%3===0) console.log('Fizz');\n    else if(i%5===0) console.log('Buzz');\n    else console.log(i);\n}",
    }
  },
];