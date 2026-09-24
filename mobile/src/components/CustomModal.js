// components/CustomModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomModal({
  visible,
  title,
  message,
  iconName,
  onClose,
  onAction,
  actionLabel,
  children
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
            {iconName && (
              <Ionicons
                name={iconName}
                size={48}
                color="#2076cc"
                style={{ marginBottom: 8, alignSelf: 'center' }}
              />
            )}
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}

            {/* This will now render pickers or any child */}
            <View style={{ width: '100%', marginBottom: 10 }}>
              {children}
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.cancel]} onPress={onClose}>
                <Text style={styles.cancelText}>Close</Text>
              </Pressable>
              {onAction && (
                <Pressable style={[styles.button, styles.save]} onPress={onAction}>
                  <Text style={styles.saveText}>{actionLabel}</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%', // wider to fit Picker
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#e5e7eb',
  },
  save: {
    backgroundColor: '#2076cc',
  },
  cancelText: {
    color: '#111',
  },
  saveText: {
    color: '#fff',
  },
});
