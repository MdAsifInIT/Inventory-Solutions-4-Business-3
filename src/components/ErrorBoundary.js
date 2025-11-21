import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
          <Text className="text-6xl mb-4">😕</Text>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</Text>
          <Text className="text-gray-500 text-center mb-6">
            We're sorry for the inconvenience. Please try again.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-indigo-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
