module.exports = function (api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache(!isTest);
  return {
    presets: [
      [
        'babel-preset-expo',
        { jsxImportSource: 'nativewind', reanimated: !isTest },
      ],
      'nativewind/babel',
    ],
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  };
};
