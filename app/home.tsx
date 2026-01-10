import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CenterModal from "../components/CenterModal";
import { getUser, removeUser, saveUser } from "../services/storage";
import { Colors } from "../theme/colors";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current; // 0 closed, 1 open
  const navigateAnim = useRef(new Animated.Value(0)).current; // px for navigation animation
  const itemAnimsRef = useRef<Animated.Value[] | null>(null);
  const { width } = Dimensions.get("window");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const storedUser = await getUser();
      if (!storedUser) {
        router.replace("/login");
        return;
      }
      setUser(storedUser);
    }

    loadUser();
  }, [router]);

  useEffect(() => {
    if (user?.transactions) {
      const values = user.transactions.map(() => new Animated.Value(0));
      itemAnimsRef.current = values;
      Animated.stagger(
        80,
        values.map((v: Animated.Value) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          })
        )
      ).start();
    }
  }, [user?.transactions]);

  function showModal(title: string, message: string) {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  }

  async function handlePickImage() {
    try {
      // @ts-ignore - optional native dependency; dynamically imported at runtime
      const ImagePicker = await import("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showModal(
          "Permissão",
          "Precisamos da permissão para acessar suas fotos."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if ((result as any).canceled) return;
      const uri = (result as any).assets
        ? (result as any).assets[0].uri
        : (result as any).uri;
      if (uri) {
        const updated = { ...user, avatar: uri };
        await saveUser(updated);
        setUser(updated);
        Animated.timing(menuAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      console.warn(err);
      showModal("Erro", "Não foi possível acessar a galeria.");
    }
  }

  async function handleRemovePhoto() {
    const updated = { ...user };
    delete updated.avatar;
    await saveUser(updated);
    setUser(updated);
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.sideMenu,
          {
            transform: [
              {
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-260, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {user.avatar && user.avatar.length ? (
              <Image
                source={{ uri: user.avatar }}
                style={[styles.menuAvatar, styles.menuAvatarBorder]}
              />
            ) : (
              <View style={styles.menuAvatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={Colors.primary}
                />
              </View>
            )}
            <Text style={[styles.menuHeaderTitle, { marginLeft: 12 }]}>
              {user.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Animated.timing(menuAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
            (async () => {
              try {
                const Haptics: any = await import("expo-haptics");
                Haptics.selectionAsync && Haptics.selectionAsync();
              } catch {}
            })();
            showModal("Poupança", "Em breve");
          }}
        >
          <Text style={styles.menuText}>Poupança</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Animated.timing(menuAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
            (async () => {
              try {
                const Haptics: any = await import("expo-haptics");
                Haptics.selectionAsync && Haptics.selectionAsync();
              } catch {}
            })();
            showModal("Seguros", "Em breve");
          }}
        >
          <Text style={styles.menuText}>Seguros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Animated.timing(menuAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
            (async () => {
              try {
                const Haptics: any = await import("expo-haptics");
                Haptics.selectionAsync && Haptics.selectionAsync();
              } catch {}
            })();
            showModal("Cartões", "Em breve");
          }}
        >
          <Text style={styles.menuText}>Cartões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Animated.timing(menuAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
            (async () => {
              try {
                const Haptics: any = await import("expo-haptics");
                Haptics.selectionAsync && Haptics.selectionAsync();
              } catch {}
            })();
            router.push("/account");
          }}
        >
          <Text style={styles.menuText}>Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePickImage}>
          <Text style={styles.menuText}>Adicionar foto de perfil</Text>
        </TouchableOpacity>

        {user.avatar && (
          <TouchableOpacity style={styles.menuItem} onPress={handleRemovePhoto}>
            <Text style={styles.menuText}>Remover foto</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateX: Animated.add(
                  menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 260],
                  }),
                  navigateAnim
                ),
              },
            ],
            borderRadius: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 14],
            }),
            overflow: "hidden",
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => {
                const to =
                  (menuAnim as any).__getValue &&
                  (menuAnim as any).__getValue() === 1
                    ? 0
                    : 1;
                Animated.timing(menuAnim, {
                  toValue: to,
                  duration: 280,
                  useNativeDriver: true,
                }).start();
                (async () => {
                  try {
                    const Haptics: any = await import("expo-haptics");
                    Haptics.selectionAsync && Haptics.selectionAsync();
                  } catch {}
                })();
              }}
              style={styles.userIconWrapper}
            >
              {user.avatar && user.avatar.length ? (
                <View style={styles.headerAvatarPlaceholder}>
                  <Image
                    source={{ uri: user.avatar }}
                    style={[styles.headerAvatar, styles.headerAvatarBorder]}
                  />
                </View>
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <MaterialCommunityIcons
                    name="account"
                    size={18}
                    color={Colors.primary}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                (async () => {
                  try {
                    const Haptics: any = await import("expo-haptics");
                    Haptics.impactAsync &&
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch {}
                })();

                Animated.timing(navigateAnim, {
                  toValue: width,
                  duration: 300,
                  useNativeDriver: true,
                  easing: Easing.in(Easing.quad),
                }).start(async () => {
                  await removeUser();
                  router.replace("/login");
                });
              }}
            >
              <Text style={styles.logout}>Sair</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.welcome}>Olá, {user.name}!</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balance}>
              R$ {user.balance.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        {/* AÇÕES */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              (async () => {
                try {
                  const Haptics: any = await import("expo-haptics");
                  Haptics.selectionAsync && Haptics.selectionAsync();
                } catch {}
              })();
              router.push("/pix");
            }}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={30}
              color={Colors.primary}
            />
            <Text style={styles.actionText}>Pix</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/pagar")}
          >
            <MaterialCommunityIcons
              name="barcode-scan"
              size={30}
              color={Colors.primary}
            />
            <Text style={styles.actionText}>Pagar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/transferir")}
          >
            <MaterialCommunityIcons
              name="bank-transfer"
              size={30}
              color={Colors.primary}
            />
            <Text style={styles.actionText}>Transferir</Text>
          </TouchableOpacity>
        </View>

        {/* TRANSAÇÕES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas transações</Text>
          <TouchableOpacity onPress={() => setShowTransactions(true)}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={user.transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => {
            const anim = itemAnimsRef.current?.[index] ?? new Animated.Value(1);
            return (
              <Animated.View
                style={[
                  styles.transactionItem,
                  styles.transactionShadow,
                  {
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const Haptics: any = await import("expo-haptics");
                      Haptics.selectionAsync && Haptics.selectionAsync();
                    } catch {}
                    showModal(
                      item.title,
                      `Valor: R$ ${Math.abs(item.amount)
                        .toFixed(2)
                        .replace(".", ",")}`
                    );
                  }}
                >
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.transactionAmount,
                    item.amount > 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {item.amount > 0 ? "+" : "-"} R${" "}
                  {Math.abs(item.amount).toFixed(2).replace(".", ",")}
                </Text>
              </Animated.View>
            );
          }}
        />

        {/* MORE FEATURES */}
        <View style={styles.moreSection}>
          <Text style={styles.sectionTitle}>Recursos</Text>
          <View style={styles.moreGrid}>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => router.push("/recarga")}
            >
              <MaterialCommunityIcons
                name="cellphone"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.moreText}>Recarga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => router.push("/investir")}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.moreText}>Investir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => router.push("/boleto")}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.moreText}>Boleto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => router.push("/emprestimo")}
            >
              <MaterialCommunityIcons
                name="bank"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.moreText}>Empréstimo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showTransactions} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Todas as transações</Text>
              <Pressable
                onPress={() => setShowTransactions(false)}
                style={styles.modalClose}
              >
                <Text style={{ color: Colors.textSecondary }}>Fechar</Text>
              </Pressable>
            </View>

            <FlatList
              data={user.transactions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      item.amount > 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.amount > 0 ? "+" : "-"} R${" "}
                    {Math.abs(item.amount).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              )}
            />
          </View>
        </Modal>
        <CenterModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* HEADER */
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 72,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarBorder: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  userMenu: {
    marginTop: 12,
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  logo: {
    width: 160,
    height: 44,
    resizeMode: "contain",
  },
  logout: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textBrown,
  },
  welcome: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.textBrown,
  },

  /* SALDO */
  balanceCard: {
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  balance: {
    fontSize: 34,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 4,
  },

  /* AÇÕES */
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -32,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: Colors.card,
    width: 96,
    height: 96,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  actionText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  /* TRANSAÇÕES */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  transactionItem: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionShadow: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  transactionTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.danger,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
    backgroundColor: Colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalClose: {
    padding: 8,
  },
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: Colors.card,
    paddingTop: 56,
    paddingHorizontal: 8,
    zIndex: 30,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  menuAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  menuAvatarBorder: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  menuAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  moreSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  moreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    justifyContent: "space-between",
  },
  moreCard: {
    width: "48%",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  moreText: {
    marginTop: 8,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarModalCard: {
    width: "86%",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  avatarInput: {
    marginTop: 8,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
  },
  avatarSaveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCancelButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButtonText: {
    color: Colors.textBrown,
    fontWeight: "700",
  },
});
