import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from "react-native";
import { useReportStore } from "@/store/useReportStore";

const { width, height } = Dimensions.get("window");

export default function TraineeReportList({ route }) {
    const { getTraineeReportListById } = useReportStore();
    const { traineeId } = route.params;
    const [previewVisible, setPreviewVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [reports, setReports] = useState([]);

    const openPreview = (files, index) => {
        setCurrentFiles(files);
        setCurrentIndex(index);
        setPreviewVisible(true);
    };

    useEffect(() => {
        const fetchReports = async () => {
            const res = await getTraineeReportListById(traineeId);
            if (res && res.success) {
                setReports(res.reports || []);
            } else {
                setReports([]);
            }
        };
        fetchReports();
    }, [traineeId]);

    const RenderDescription = ({ text }) => {
        const [expanded, setExpanded] = useState(false);
        const limit = 100; // character limit before truncation

        if (!text) return null;

        const shouldTruncate = text.length > limit;
        const displayText = expanded ? text : text.slice(0, limit) + (shouldTruncate ? "..." : "");

        return (
            <View style={{ marginBottom: 6 }}>
                <Text style={styles.description}>{displayText}</Text>
                {shouldTruncate && (
                    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                        <Text style={styles.showMore}>
                            {expanded ? "Show less" : "Show more"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Description with show more/less */}
            <RenderDescription text={item.description} />

            {/* Date */}
            {item.date && (
                <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            )}

            {/* Attached Images */}
            {item.files && item.files.length > 0 ? (
                <FlatList
                    data={item.files}
                    keyExtractor={(url, idx) => idx.toString()}
                    numColumns={4}
                    renderItem={({ item: url, index }) => (
                        <TouchableOpacity
                            onPress={() => openPreview(item.files, index)}
                            style={styles.imageWrapper}
                        >
                            <Image source={{ uri: url }} style={styles.gridImage} />
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noFiles}>No images attached</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Full Screen Preview */}
            <Modal visible={previewVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        contentOffset={{ x: currentIndex * width, y: 0 }}
                    >
                        {currentFiles.map((url, idx) => (
                            <View key={idx} style={styles.fullImageWrapper}>
                                <Image source={{ uri: url }} style={styles.fullImage} />
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setPreviewVisible(false)}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F7F9",
        padding: 16,
    },
    listContent: {
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: "#374151",
    },
    showMore: {
        fontSize: 13,
        color: "#1E4FC2",
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: "#9ca3af",
        marginBottom: 10,
    },
    imageWrapper: {
        flex: 1,
        margin: 2,
    },
    gridImage: {
        width: (width - 64) / 4, // 4 per row (with padding)
        height: (width - 64) / 4,
        borderRadius: 8,
        backgroundColor: "#F6F7F9",
    },
    noFiles: {
        fontSize: 13,
        color: "#9ca3af",
        fontStyle: "italic",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "black",
    },
    fullImageWrapper: {
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
    },
    fullImage: {
        width,
        height,
        resizeMode: "contain",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        padding: 10,
    },
    closeText: {
        fontSize: 18,
        color: "white",
    },
});