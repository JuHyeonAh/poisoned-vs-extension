// webpack.config.js
const path = require('path');

module.exports = {
  target: 'node',                        // VS Code 확장은 Node 환경에서 동작합니다.
  entry: './src/extension.ts',           // 확장의 진입점(보통 src/extension.ts)
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'           // VS Code가 require()할 수 있게 commonjs2 사용
  },
  devtool: 'source-map',                 // 디버그를 위해 소스맵 생성
  externals: {
    vscode: 'commonjs vscode'            // 'vscode' 모듈은 번들하지 않고 런타임에 제공
  },
  resolve: {
    extensions: ['.ts', '.js']           // .ts와 .js 확장자를 자동으로 해석
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',         // TypeScript를 JavaScript로 변환
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
};
// const path = require('path');

// module.exports = {
//   target: "node",                // VS Code 확장은 Node 환경에서 구동됩니다.
//   entry: "./src/extension.ts",   // 여러분의 TypeScript 진입점 파일
//   output: {
//     path: path.resolve(__dirname, "dist"),
//     filename: "extension.js",
//     libraryTarget: "commonjs2"   // commonjs2 모듈 형식으로 번들링
//   },
//   node: {
//     __dirname: false,
//     __filename: false
//   },
//   resolve: {
//     extensions: [".ts", ".js"]
//   },
//   externals: {
//     vscode: "commonjs vscode"    // 'vscode' 모듈은 외부로 빼두기
//   },
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: "ts-loader",
//             options: {
//               transpileOnly: true
//             }
//           }
//         ]
//       }
//     ]
//   },
//   devtool: "source-map"          // (선택) 디버깅용 소스맵
// };
